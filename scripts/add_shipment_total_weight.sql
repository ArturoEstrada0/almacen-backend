-- Migration: Add total_weight column to shipments
-- Run this on your PostgreSQL database to add the new column used by the Shipment entity.
-- Example (psql):
-- psql -h <host> -U <user> -d <database> -f ./scripts/add_shipment_total_weight.sql

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS total_weight numeric(10,2);

-- Optionally, if you want existing shipments to have a default 0.00 value:
-- UPDATE shipments SET total_weight = 0.00 WHERE total_weight IS NULL;

-- Notes:
-- - This SQL is safe to run multiple times thanks to IF NOT EXISTS.
-- - If your DB is not PostgreSQL, adjust the numeric type accordingly (e.g. DECIMAL(10,2)).
