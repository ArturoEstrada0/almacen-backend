const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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
  const root = __dirname;
  const prodFile = path.join(root, 'prod_data.sql');
  if (!fs.existsSync(prodFile)) {
    console.error('prod_data.sql not found. Run dump-and-restore-prod-to-local.js first or generate prod_data.sql');
    process.exit(1);
  }

  const prodEnv = parseEnvFile(path.join(root, '.env.prod'));
  const localEnv = parseEnvFile(path.join(root, '.env'));
  const localUrl = localEnv.DATABASE_URL || process.env.DATABASE_URL;
  if (!localUrl) {
    console.error('Missing local DATABASE_URL in .env');
    process.exit(1);
  }

  const localClient = new Client({ connectionString: localUrl, ssl: localEnv.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });
  await localClient.connect();

  const content = fs.readFileSync(prodFile, 'utf8');
  // Split into blocks by '-- Table: name' marker
  const parts = content.split(/-- Table: /g);
  // parts[0] is header (BEGIN; etc)
  const header = parts[0];
  const tableBlocks = parts.slice(1).map(p => {
    const nl = p.indexOf('\n');
    const table = p.slice(0, nl).trim();
    const sql = p.slice(nl+1).trim();
    return { table, sql };
  });

  // For safety, start transaction per table
  for (const blk of tableBlocks) {
    const t = blk.table;
    // check if table exists locally
    let exists = false;
    try {
      const ex = await localClient.query("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1", [t]);
      exists = ex.rows.length > 0;
    } catch (e) {
      exists = false;
    }

    let localCount = null;
    if (exists) {
      try {
        const rc = await localClient.query(`SELECT COUNT(*) AS c FROM public."${t}"`);
        localCount = parseInt(rc.rows[0].c, 10);
      } catch (e) {
        localCount = null;
      }
    }

    if (!exists) {
      console.log(`Creating missing table ${t} skipped (schema not present).`);
      continue;
    }

    if (localCount === null) {
      console.log(`Skipping ${t} (couldn't determine local count)`);
      continue;
    }

    if (localCount > 0) {
      console.log(`Skipping ${t} (${localCount} rows present locally)`);
      continue;
    }

    // Table exists and is empty -> apply SQL block
    console.log(`Restoring table ${t} (empty locally)`);
    try {
      await localClient.query("SET session_replication_role = 'replica'");
      await localClient.query('BEGIN');
      // execute only insert statements from blk.sql
      // assume blk.sql contains INSERT statements and maybe comments
      const statements = blk.sql.split(/;\n/).map(s => s.trim()).filter(s => s.length > 0);
      for (const st of statements) {
        // skip BEGIN/COMMIT if present
        const s = st.replace(/\n/g, ' ').trim();
        if (/^BEGIN/i.test(s) || /^COMMIT/i.test(s)) continue;
        await localClient.query(s);
      }
      await localClient.query('COMMIT');
      await localClient.query("SET session_replication_role = 'origin'");
      console.log(`Restored ${t}`);
    } catch (err) {
      console.error(`Failed restoring ${t}:`, err.message);
      try { await localClient.query('ROLLBACK'); await localClient.query("SET session_replication_role = 'origin'"); } catch (e) {}
    }
  }

  await localClient.end();
  console.log('Done');
}

main().catch(err => { console.error(err); process.exit(1); });
