-- Migration: Add lot_number and expiration_date to inventory table
-- This migration adds fields for tracking lot numbers and expiration dates in inventory

-- Add lot_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'lot_number'
    ) THEN
        ALTER TABLE inventory ADD COLUMN lot_number VARCHAR(100);
        COMMENT ON COLUMN inventory.lot_number IS 'Lot number for tracking batches of products';
    END IF;
END $$;

-- Add expiration_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'expiration_date'
    ) THEN
        ALTER TABLE inventory ADD COLUMN expiration_date DATE;
        COMMENT ON COLUMN inventory.expiration_date IS 'Expiration date for perishable products';
    END IF;
END $$;

-- Create index on lot_number for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_lot_number ON inventory(lot_number);

-- Create index on expiration_date for faster queries on expiring products
CREATE INDEX IF NOT EXISTS idx_inventory_expiration_date ON inventory(expiration_date);

COMMENT ON TABLE inventory IS 'Inventory tracking with lot numbers and expiration dates';
