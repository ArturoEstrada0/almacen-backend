#!/usr/bin/env node
// Import normalized inventory JSON into Postgres using plain SQL via 'pg'.
// Usage (dry-run): node scripts/import-inventory.js data/imports/INVENTARIO-MERCER-FRESH.json
// To apply changes: node scripts/import-inventory.js data/imports/INVENTARIO-MERCER-FRESH.json --apply

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')
require('dotenv').config()

const file = process.argv[2]
const apply = process.argv.includes('--apply')
const warehouseCode = process.env.WAREHOUSE_CODE || 'MAIN'

if (!file) {
  console.error('Usage: node scripts/import-inventory.js path/to/json [--apply]')
  process.exit(2)
}

const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
if (!fs.existsSync(abs)) {
  console.error('File not found:', abs)
  process.exit(2)
}

const data = JSON.parse(fs.readFileSync(abs, 'utf8'))
if (!Array.isArray(data) || data.length === 0) {
  console.error('No data to import')
  process.exit(2)
}

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
// Avoid uncaught 'error' events bubbling out of the pg client
client.on('error', (err) => {
  console.error('PG client error:', err && err.message ? err.message : err)
})

async function run() {
  await client.connect()
  try {
    // Ensure warehouse exists (create if missing)
    let res = await client.query('SELECT id FROM warehouses WHERE code = $1 LIMIT 1', [warehouseCode])
    let warehouseId
    if (res.rows.length === 0) {
      console.log(`Warehouse with code '${warehouseCode}' not found. Creating.`)
      if (apply) {
        res = await client.query('INSERT INTO warehouses (name, code, created_at, updated_at) VALUES ($1, $2, now(), now()) RETURNING id', [warehouseCode, warehouseCode])
        warehouseId = res.rows[0].id
      } else {
        warehouseId = '<new-warehouse-id>'
      }
    } else {
      warehouseId = res.rows[0].id
    }

    console.log(`Using warehouse id: ${warehouseId}`)

    let created = 0
    let updated = 0
    for (const item of data) {
      const sku = (item.code || '').toString().trim()
      const name = (item.description || '').toString().trim()
      const qty = item.stock == null ? 0 : Number(item.stock)

      if (!sku) continue

      // find product
      res = await client.query('SELECT id FROM products WHERE sku = $1 LIMIT 1', [sku])
      let productId
      if (res.rows.length === 0) {
        console.log(`Product ${sku} not found. Will create.`)
        if (apply) {
          res = await client.query('INSERT INTO products (sku, name, created_at, updated_at) VALUES ($1, $2, now(), now()) RETURNING id', [sku, name || sku])
          productId = res.rows[0].id
          created++
        } else {
          productId = '<new-product-id>'
        }
      } else {
        productId = res.rows[0].id
      }

      // upsert inventory
      if (apply) {
        await client.query(
          `INSERT INTO inventory (product_id, warehouse_id, quantity, min_stock, max_stock, reorder_point, created_at, updated_at)
           VALUES ($1,$2,$3,0,0,0,now(),now())
           ON CONFLICT (product_id, warehouse_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = now()`,
          [productId, warehouseId, qty],
        )
        updated++
      } else {
        console.log(`[DRY] Would upsert inventory: sku=${sku} qty=${qty}`)
      }
    }

    console.log(`Done. Created products: ${created}, upserted inventory rows: ${updated}`)
  } finally {
    await client.end()
  }
}

run().catch(err => { console.error(err); process.exit(1) })
