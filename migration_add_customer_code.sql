-- Add customer_code to customers and make RFC optional for legacy records
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS customer_code VARCHAR(100);

ALTER TABLE customers
  ALTER COLUMN rfc DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_customer_code ON customers(customer_code);