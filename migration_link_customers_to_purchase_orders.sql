-- Migration: Add customer relationship to purchase orders
-- Description: Adds optional customer_id foreign key to purchase_orders table
-- Created at: 2025-03-31

ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- Add foreign key constraint
ALTER TABLE purchase_orders
ADD CONSTRAINT fk_purchase_orders_customer_id 
FOREIGN KEY (customer_id) 
REFERENCES customers(id) 
ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchase_orders_customer_id ON purchase_orders(customer_id);

-- Create index for lookups by customer
CREATE INDEX IF NOT EXISTS idx_purchase_orders_customer_supplier ON purchase_orders(customer_id, supplier_id);
