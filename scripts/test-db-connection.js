#!/usr/bin/env node
// Simple DB connection test using `pg`.
// Usage:
//   DATABASE_URL="postgresql://..." node scripts/test-db-connection.js

const { Client } = require('pg')

const url = process.env.DATABASE_URL || process.argv[2]

if (!url) {
  console.error('No DATABASE_URL provided. Set env var or pass as first arg.')
  process.exit(2)
}

// Configure SSL for managed Postgres (Supabase) - allow self-signed certs by default
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })

async function run() {
  try {
    await client.connect()
    console.log('✅ Conectado al servidor Postgres')
    const res = await client.query('SELECT NOW() as now')
    console.log('Server time:', res.rows[0].now)
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('❌ Error conectando a la BD:', err.message || err)
    process.exit(1)
  }
}

run()
