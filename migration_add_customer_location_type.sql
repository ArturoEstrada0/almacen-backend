-- Add customer type and country to customers
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) NOT NULL DEFAULT 'nacional';

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) NOT NULL DEFAULT 'México';

UPDATE customers
SET customer_type = COALESCE(customer_type, 'nacional'),
    country = COALESCE(country, 'México');