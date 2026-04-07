const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)
  const res = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx)
    let val = trimmed.slice(idx+1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1,-1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1,-1)
    res[key] = val
  }
  return res
}

async function main(){
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    console.error('.env not found at', envPath)
    process.exit(1)
  }
  const env = parseEnv(envPath)
  const id = process.argv[2] || env.CHECK_SHIPMENT_ID
  if (!id) {
    console.error('Provide shipment id as first arg or set CHECK_SHIPMENT_ID in .env')
    process.exit(1)
  }

  const clientConfig = {}
  if (env.DATABASE_URL) {
    clientConfig.connectionString = env.DATABASE_URL
  } else {
    clientConfig.host = env.DB_HOST
    clientConfig.port = env.DB_PORT ? Number(env.DB_PORT) : undefined
    clientConfig.user = env.DB_USERNAME || env.DB_USER
    clientConfig.password = env.DB_PASSWORD
    clientConfig.database = env.DB_DATABASE
  }

  // Configure SSL when DB_FORCE_SSL is enabled
  if (env.DB_FORCE_SSL === 'true' || env.DB_FORCE_SSL === '1') {
    clientConfig.ssl = { rejectUnauthorized: false }
  }

  // If DATABASE_URL has surrounding quotes, strip them
  if (clientConfig.connectionString && typeof clientConfig.connectionString === 'string') {
    clientConfig.connectionString = clientConfig.connectionString.replace(/^\"|\"$/g, '')
  }

  const client = new Client(clientConfig)
  try {
    await client.connect()
    const q = await client.query('SELECT id, invoice_url, carrier_invoice_url, waybill_url FROM shipments WHERE id = $1', [id])
    if (q.rows.length === 0) {
      console.log('No shipment found with id', id)
    } else {
      console.log('Shipment:', q.rows[0])
    }
  } catch (err) {
    console.error('DB error:', err.message || err)
  } finally {
    await client.end().catch(()=>{})
  }
}

main()
