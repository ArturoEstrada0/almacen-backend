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

async function getTables(client) {
  const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  return rows.map(r => r.table_name);
}

async function getPrimaryKey(client, table) {
  const sql = `
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = $1
    ORDER BY kcu.ordinal_position
  `;
  const { rows } = await client.query(sql, [table]);
  return rows.map(r => r.column_name);
}

async function getColumns(client, table) {
  const { rows } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position", [table]);
  return rows.map(r => r.column_name);
}

async function tableHash(client, table) {
  // determine ordering
  const pk = await getPrimaryKey(client, table);
  const cols = await getColumns(client, table);
  const orderBy = pk.length ? pk.map(c => `"${c}"`).join(', ') : cols.map(c => `"${c}"`).join(', ');

  // compute md5 per row and aggregate deterministically
  const sql = `SELECT md5(string_agg(h, '')) AS tbl_hash FROM (SELECT md5(row_to_json(t)::text) AS h FROM (SELECT ${cols.map(c=>`"${c}"`).join(', ')} FROM public."${table}" ORDER BY ${orderBy}) t) s`;
  try {
    const { rows } = await client.query(sql);
    return rows[0] ? rows[0].tbl_hash : null;
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  const root = __dirname;
  const prodEnv = parseEnvFile(path.join(root, '.env.prod'));
  const localEnv = parseEnvFile(path.join(root, '.env'));
  const prodUrl = prodEnv.DATABASE_URL || process.env.PROD_DATABASE_URL;
  const localUrl = localEnv.DATABASE_URL || process.env.DATABASE_URL;
  if (!prodUrl || !localUrl) {
    console.error('Missing DATABASE_URL in .env or .env.prod');
    process.exit(1);
  }

  const prodClient = new Client({ connectionString: prodUrl, ssl: prodEnv.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });
  const localClient = new Client({ connectionString: localUrl, ssl: localEnv.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });
  await prodClient.connect();
  await localClient.connect();

  const prodTables = await getTables(prodClient);
  const localTables = await getTables(localClient);
  const tables = Array.from(new Set([...prodTables, ...localTables])).sort();

  const results = [];
  for (const t of tables) {
    process.stdout.write(`Processing ${t}... `);
    const prodHash = await tableHash(prodClient, t);
    const localHash = await tableHash(localClient, t);
    results.push({ table: t, prod: prodHash, local: localHash });
    console.log('done');
  }

  console.log('\nChecksum results (prod vs local):');
  for (const r of results) {
    const prodVal = r.prod && typeof r.prod === 'object' && r.prod.error ? `ERROR(${r.prod.error})` : (r.prod || 'N/A');
    const localVal = r.local && typeof r.local === 'object' && r.local.error ? `ERROR(${r.local.error})` : (r.local || 'N/A');
    const match = (typeof r.prod === 'string' && typeof r.local === 'string' && r.prod === r.local) ? 'MATCH' : 'DIFFER';
    console.log(`- ${r.table}: ${match}\n    prod: ${prodVal}\n    local: ${localVal}`);
  }

  await prodClient.end();
  await localClient.end();
}

main().catch(err => { console.error(err); process.exit(1); });
