const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const out = {};
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  const repoRoot = path.join(__dirname);
  const prodEnvPath = path.join(repoRoot, '.env.prod');
  const prodEnv = parseEnvFile(prodEnvPath);
  const prodUrl = prodEnv.DATABASE_URL || process.env.PROD_DATABASE_URL;
  const localUrl = process.env.DATABASE_URL || parseEnvFile(path.join(repoRoot, '.env')).DATABASE_URL;

  const onlyMissing = process.argv.includes('--only-missing');

  if (!prodUrl) {
    console.error('Missing production DATABASE_URL (.env.prod).');
    process.exit(1);
  }
  if (!localUrl) {
    console.error('Missing local DATABASE_URL (.env).');
    process.exit(1);
  }

  const prodClient = new Client({ connectionString: prodUrl, ssl: prodEnv.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });
  const localClient = new Client({ connectionString: localUrl, ssl: process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });

  await prodClient.connect();
  await localClient.connect();

  console.log('Connected to production and local databases');

  // Get tables
  const { rows: tableRows } = await prodClient.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const exclude = new Set(['spatial_ref_sys','migrations','knex_migrations','typeorm_migrations','typeorm_metadata']);

  for (const { table_name } of tableRows) {
    // If requested, skip tables that already have rows locally
    if (onlyMissing) {
      try {
        const { rows: localCountRows } = await localClient.query(`SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema='public' AND table_name = $1`, [table_name]);
        // if the table exists, check row count
        const exists = localCountRows.length > 0 && localCountRows[0];
        let rowCount = 0;
        if (exists) {
          try {
            const { rows: rc } = await localClient.query(`SELECT COUNT(*) AS c FROM public."${table_name}"`);
            rowCount = parseInt(rc[0].c, 10);
          } catch (e) {
            rowCount = 0;
          }
        }
        if (rowCount > 0) {
          console.log(`Skipping ${table_name} (already has ${rowCount} rows locally)`);
          continue;
        }
      } catch (e) {
        // if we can't query local metadata, proceed to copy
      }
    }
    if (exclude.has(table_name)) {
      console.log(`Skipping table ${table_name}`);
      continue;
    }

    console.log(`\nProcessing table: ${table_name}`);

    // Get columns (with metadata) from production
    const { rows: cols } = await prodClient.query(
      `SELECT column_name, is_nullable, column_default, udt_name, data_type, character_maximum_length, numeric_precision, numeric_scale
       FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position`,
      [table_name]
    );
    const columns = cols.map((r) => r.column_name);
    if (columns.length === 0) {
      console.log(`No columns for ${table_name}, skipping`);
      continue;
    }

    // Truncate local table
    try {
      await localClient.query('BEGIN');
      await localClient.query(`TRUNCATE TABLE public."${table_name}" RESTART IDENTITY CASCADE`);
      await localClient.query('COMMIT');
      console.log(`Truncated local table ${table_name}`);
    } catch (err) {
      await localClient.query('ROLLBACK');
      console.error(`Failed truncating ${table_name}:`, err.message);
      console.log('Will attempt to continue.');
    }

    // Ensure local has all columns from production (add missing as nullable)
    try {
      const { rows: localColsRows } = await localClient.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1`,
        [table_name]
      );
      const localCols = new Set(localColsRows.map((r) => r.column_name));
      for (const c of cols) {
        if (!localCols.has(c.column_name)) {
          // Build column type
          let colType = c.data_type;
          if (c.data_type === 'character varying' && c.character_maximum_length) {
            colType = `varchar(${c.character_maximum_length})`;
          } else if (c.data_type === 'numeric' && c.numeric_precision) {
            colType = `numeric(${c.numeric_precision}, ${c.numeric_scale || 0})`;
          } else if (c.udt_name && c.data_type === 'USER-DEFINED') {
            colType = c.udt_name;
          }

          const defaultSql = c.column_default ? ` DEFAULT ${c.column_default}` : '';
          const addSql = `ALTER TABLE public."${table_name}" ADD COLUMN IF NOT EXISTS "${c.column_name}" ${colType}${defaultSql}`;
          try {
            await localClient.query(addSql);
            console.log(`Added column ${c.column_name} to local.${table_name}`);
          } catch (err) {
            console.error(`Failed adding column ${c.column_name} to ${table_name}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error('Error ensuring columns exist locally:', err.message);
    }

    // Fetch rows from prod
    const { rows: data } = await prodClient.query(`SELECT * FROM public."${table_name}"`);
    console.log(`Fetched ${data.length} rows from production.${table_name}`);

    if (data.length === 0) continue;

    // Insert rows into local in a transaction
    try {
      // disable triggers/constraints to avoid FK order issues
      await localClient.query("SET session_replication_role = 'replica'");
      await localClient.query('BEGIN');
      const colList = columns.map((c) => `"${c}"`).join(', ');
      // Insert rows one by one to avoid parameter count limits; group into small batches
      const batchSize = 500;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const valuesSql = [];
        const values = [];
        let paramIdx = 1;
        for (const row of batch) {
          const placeholders = [];
          for (const col of columns) {
            placeholders.push(`$${paramIdx++}`);
            let v = row[col];
            // Convert objects/arrays to JSON
            if (v && typeof v === 'object') v = JSON.stringify(v);
            values.push(v);
          }
          valuesSql.push(`(${placeholders.join(',')})`);
        }
        const insertSql = `INSERT INTO public."${table_name}" (${colList}) VALUES ${valuesSql.join(',')}`;
        await localClient.query(insertSql, values);
      }
      await localClient.query('COMMIT');
      // restore constraints enforcement
      await localClient.query("SET session_replication_role = 'origin'");
      console.log(`Inserted ${data.length} rows into local.${table_name}`);
    } catch (err) {
      await localClient.query('ROLLBACK');
      try {
        await localClient.query("SET session_replication_role = 'origin'");
      } catch (e) {}
      console.error(`Error inserting into ${table_name}:`, err.message);
    }

    // Count verification
    try {
      const { rows: prodCount } = await prodClient.query(`SELECT COUNT(*) AS c FROM public."${table_name}"`);
      const { rows: localCount } = await localClient.query(`SELECT COUNT(*) AS c FROM public."${table_name}"`);
      console.log(`Counts - prod: ${prodCount[0].c}, local: ${localCount[0].c}`);
    } catch (err) {
      console.error('Count verification failed:', err.message);
    }
  }

  await prodClient.end();
  await localClient.end();

  console.log('\nCopy complete');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
