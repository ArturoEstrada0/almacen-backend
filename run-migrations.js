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

    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
