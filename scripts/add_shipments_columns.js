const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const client = new Client({ connectionString, ssl: process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false });

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');

    const cols = ['invoice_url','carrier_invoice_url','waybill_url'];
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='shipments' AND column_name = ANY($1)`, [cols]);
    const existing = res.rows.map(r => r.column_name);
    console.log('Existing columns:', existing);

    for (const col of cols) {
      if (!existing.includes(col)) {
        console.log('Adding column', col);
        const sql = `DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='${col}') THEN\n    EXECUTE 'ALTER TABLE shipments ADD COLUMN ${col} VARCHAR(500)';\n  END IF;\nEND$$;`;
        await client.query(sql);
        console.log('Added', col);
      } else {
        console.log('Skipping, already exists:', col);
      }
    }

    // Add comments (safe)
    await client.query("COMMENT ON COLUMN shipments.invoice_url IS 'URL to the shipment invoice (PDF/XML)';");
    await client.query("COMMENT ON COLUMN shipments.carrier_invoice_url IS 'URL to the carrier invoice (PDF/XML)';");
    await client.query("COMMENT ON COLUMN shipments.waybill_url IS 'URL to the complementary waybill/document (PDF/XML)';");
    console.log('Comments applied');

    console.log('Done');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
