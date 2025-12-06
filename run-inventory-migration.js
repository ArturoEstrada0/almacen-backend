const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runInventoryMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres.ehpssgacrncyarzxogmv:ItzGivenODST@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Run inventory fields migration
    console.log('\n📝 Running inventory fields migration...');
    const inventoryFieldsSQL = fs.readFileSync(path.join(__dirname, 'migration_add_inventory_fields.sql'), 'utf8');
    await client.query(inventoryFieldsSQL);
    console.log('✅ inventory fields migration completed');

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runInventoryMigration();
