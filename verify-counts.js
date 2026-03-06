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

  const { rows: prodTables } = await prodClient.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`);
  const { rows: localTables } = await localClient.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`);

  const prodSet = new Set(prodTables.map(r => r.table_name));
  const localSet = new Set(localTables.map(r => r.table_name));

  const allTables = new Set([...prodSet, ...localSet]);

  const diffs = [];
  for (const t of Array.from(allTables).sort()) {
    let prodCount = null;
    let localCount = null;
    try {
      const r1 = await prodClient.query(`SELECT COUNT(*) AS c FROM public."${t}"`);
      prodCount = parseInt(r1.rows[0].c, 10);
    } catch (e) {
      prodCount = null;
    }
    try {
      const r2 = await localClient.query(`SELECT COUNT(*) AS c FROM public."${t}"`);
      localCount = parseInt(r2.rows[0].c, 10);
    } catch (e) {
      localCount = null;
    }
    if (prodCount !== localCount) {
      diffs.push({ table: t, prod: prodCount, local: localCount });
    }
  }

  console.log('Table differences (prod vs local):');
  if (diffs.length === 0) console.log('  All matching or not queryable');
  else {
    for (const d of diffs) console.log(`  - ${d.table}: prod=${d.prod ?? 'N/A'} local=${d.local ?? 'N/A'}`);
  }

  // show tables present in prod but not in local
  const missingInLocal = Array.from(prodSet).filter(t => !localSet.has(t));
  if (missingInLocal.length) {
    console.log('\nTables present in production but missing locally:');
    for (const t of missingInLocal) console.log(`  - ${t}`);
  }

  await prodClient.end();
  await localClient.end();
}

main().catch(err => { console.error(err); process.exit(1); });
