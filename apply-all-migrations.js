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
  const localEnv = parseEnvFile(path.join(repoRoot, '.env'));
  const localUrl = process.env.DATABASE_URL || localEnv.DATABASE_URL;
  if (!localUrl) {
    console.error('Missing local DATABASE_URL (.env)');
    process.exit(1);
  }

  const client = new Client({ connectionString: localUrl, ssl: process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });
  await client.connect();
  console.log('Connected to local DB');

  const files = fs.readdirSync(repoRoot).filter((f) => f.startsWith('migration_') && f.endsWith('.sql')).sort();
  for (const file of files) {
    const filePath = path.join(repoRoot, file);
    console.log(`\nApplying ${file} ...`);
    let sql = fs.readFileSync(filePath, 'utf8');

    // Basic safe transforms
    sql = sql.replace(/ALTER TABLE\s+([^\s]+)\s+ADD COLUMN\s+/gi, (m, p1) => {
      return `ALTER TABLE ${p1} ADD COLUMN IF NOT EXISTS `;
    });
    sql = sql.replace(/CREATE TABLE\s+/gi, 'CREATE TABLE IF NOT EXISTS ');
    sql = sql.replace(/CREATE INDEX\s+/gi, 'CREATE INDEX IF NOT EXISTS ');

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`Applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed ${file}:`, err.message);
      console.log('Continuing to next migration');
    }
  }

  await client.end();
  console.log('\nAll done');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
