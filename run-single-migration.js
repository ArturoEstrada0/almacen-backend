const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const file = process.argv[2] || 'migration_add_contact_name.sql';

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    console.log(`\n📝 Running ${file}...`);
    await client.query(sql);
    console.log(`✅ ${file} applied`);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
