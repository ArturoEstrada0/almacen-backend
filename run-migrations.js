const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres.ehpssgacrncyarzxogmv:ItzGivenODST@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Run carrier_contact migration
    console.log('\n📝 Running carrier_contact migration...');
    const carrierContactSQL = fs.readFileSync(path.join(__dirname, 'migration_add_carrier_contact.sql'), 'utf8');
    await client.query(carrierContactSQL);
    console.log('✅ carrier_contact migration completed');

    // Run payment_reports migration
    console.log('\n📝 Running payment_reports migration...');
    const paymentReportsSQL = fs.readFileSync(path.join(__dirname, 'migration_payment_reports.sql'), 'utf8');
    await client.query(paymentReportsSQL);
    console.log('✅ payment_reports migration completed');

    // Run payment_reports documents migration
    console.log('\n📝 Running payment_reports documents migration...');
    const paymentReportsDocsSQL = fs.readFileSync(path.join(__dirname, 'migration_payment_reports_documents.sql'), 'utf8');
    await client.query(paymentReportsDocsSQL);
    console.log('✅ payment_reports documents migration completed');

    // Run payment_status migration
    console.log('\n📝 Running payment_status migration...');
    const paymentStatusSQL = fs.readFileSync(path.join(__dirname, 'migration_add_payment_status.sql'), 'utf8');
    await client.query(paymentStatusSQL);
    console.log('✅ payment_status migration completed');

    // Run contact_name migration
    console.log('\n📝 Running contact_name migration...');
    const contactNameSQL = fs.readFileSync(path.join(__dirname, 'migration_add_contact_name.sql'), 'utf8');
    await client.query(contactNameSQL);
    console.log('✅ contact_name migration completed');

    // Run inventory fields migration
    console.log('\n📝 Running inventory fields migration...');
    const inventoryFieldsSQL = fs.readFileSync(path.join(__dirname, 'migration_add_inventory_fields.sql'), 'utf8');
    await client.query(inventoryFieldsSQL);
    console.log('✅ inventory fields migration completed');

    // Run product catalog migration
    console.log('\n📝 Running product catalog migration...');
    const productCatalogSQL = fs.readFileSync(path.join(__dirname, 'migration_add_product_catalog.sql'), 'utf8');
    await client.query(productCatalogSQL);
    console.log('✅ product catalog migration completed');

    // Run product type migration
    console.log('\n📝 Running product type migration...');
    const productTypeSQL = fs.readFileSync(path.join(__dirname, 'migration_update_product_type_to_varchar.sql'), 'utf8');
    await client.query(productTypeSQL);
    console.log('✅ product type migration completed');

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
