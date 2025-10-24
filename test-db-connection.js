const { Client } = require('pg')

async function main() {
  const cs = process.env.DATABASE_URL
  if (!cs) {
    console.error('ERROR: DATABASE_URL not set')
    process.exit(1)
  }

  console.log('Testing DB connection using connection string from env (hidden)')

  const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    const res = await client.query('SELECT now() as now')
    console.log('OK connected, now =', res.rows[0].now)
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('DB connect error:')
    console.error(err)
    process.exit(2)
  }
}

main()
