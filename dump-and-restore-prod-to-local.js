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

function sqlLiteral(value, colType) {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) {
    return `'\\x${value.toString('hex')}'::bytea`;
  }
  if (typeof value === 'object') {
    const s = JSON.stringify(value).replace(/'/g, "''");
    if (colType && (colType === 'json' || colType === 'jsonb')) return `'${s}'::${colType}`;
    return `'${s}'`;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  // string
  const esc = String(value).replace(/'/g, "''");
  return `'${esc}'`;
}

async function main() {
  const root = __dirname;
  const prodEnv = parseEnvFile(path.join(root, '.env.prod'));
  const localEnv = parseEnvFile(path.join(root, '.env'));
  const prodUrl = prodEnv.DATABASE_URL || process.env.PROD_DATABASE_URL;
  const localUrl = localEnv.DATABASE_URL || process.env.DATABASE_URL;
  if (!prodUrl || !localUrl) {
    console.error('Missing DATABASE_URL in .env.prod or .env');
    process.exit(1);
  }

  const prodClient = new Client({ connectionString: prodUrl, ssl: prodEnv.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });
  const localClient = new Client({ connectionString: localUrl, ssl: localEnv.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });

  await prodClient.connect();
  await localClient.connect();

  const { rows: tableRows } = await prodClient.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`);
  const exclude = new Set(['spatial_ref_sys', 'typeorm_metadata']);
  const outFile = path.join(root, 'prod_data.sql');
  const ws = fs.createWriteStream(outFile, { encoding: 'utf8' });

  ws.write('-- Dumped from production\n');
  ws.write('BEGIN;\n');

  for (const { table_name } of tableRows) {
    if (exclude.has(table_name)) continue;
    console.log('Dumping table', table_name);
    ws.write(`-- Table: ${table_name}\n`);

    // fetch columns types
    const { rows: cols } = await prodClient.query(`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position`, [table_name]);
    const columns = cols.map(c => c.column_name);
    const colTypes = {};
    for (const c of cols) colTypes[c.column_name] = (c.data_type === 'USER-DEFINED') ? c.udt_name : c.data_type;

    // fetch rows in batches
    const batchSize = 500;
    const { rows: countR } = await prodClient.query(`SELECT COUNT(*) AS c FROM public."${table_name}"`);
    const total = parseInt(countR[0].c, 10);
    for (let offset = 0; offset < total; offset += batchSize) {
      const { rows: data } = await prodClient.query({ text: `SELECT * FROM public."${table_name}" ORDER BY 1 LIMIT $1 OFFSET $2`, values: [batchSize, offset] });
      if (data.length === 0) continue;
      const colList = columns.map(c => `"${c}"`).join(', ');
      const valuesSql = data.map(row => {
        const vals = columns.map(col => sqlLiteral(row[col], colTypes[col]));
        return `(${vals.join(',')})`;
      });
      const insertSql = `INSERT INTO public."${table_name}" (${colList}) VALUES ${valuesSql.join(',')};\n`;
      ws.write(insertSql);
    }
  }

  ws.write('COMMIT;\n');
  ws.end();
  console.log('Dump written to', outFile);

  // Now restore into local
  console.log('Restoring into local DB...');
  try {
    const sql = fs.readFileSync(outFile, 'utf8');
    await localClient.query("SET session_replication_role = 'replica'");
    await localClient.query('BEGIN');
    await localClient.query(sql);
    await localClient.query('COMMIT');
    await localClient.query("SET session_replication_role = 'origin'");
    console.log('Restore completed successfully');
  } catch (err) {
    console.error('Restore failed:', err.message);
    try {
      await localClient.query('ROLLBACK');
      await localClient.query("SET session_replication_role = 'origin'");
    } catch (e) {}
  }

  await prodClient.end();
  await localClient.end();
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
