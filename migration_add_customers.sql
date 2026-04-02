-- Migration: Add customers table
-- Description: Creates the customers table with all necessary fields for customer management
-- Created at: 2025-03-31

-- Create ENUM type for payment methods
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    rfc VARCHAR(13) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    
    -- Address
    street VARCHAR(255) NOT NULL,
    street_number VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    full_address TEXT,
    
    -- Contact
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    
    -- Payment data
    payment_method payment_method DEFAULT 'bank_transfer',
    credit_days INTEGER DEFAULT 0,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    clabe VARCHAR(18),
    
    -- Status
    active BOOLEAN DEFAULT true,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_rfc_format CHECK (rfc ~ '^[A-Z0-9]{12,13}$'),
    CONSTRAINT check_phone_format CHECK (phone ~ '^\+?52?1?\d{10}$' OR phone ~ '^[0-9]{10}$'),
    CONSTRAINT check_postal_code CHECK (postal_code ~ '^[0-9]{5}$')
);

-- Create indexes
CREATE INDEX idx_customers_rfc ON customers(rfc);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_active ON customers(active);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at_trigger ON customers;
CREATE TRIGGER customers_updated_at_trigger
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_customers_updated_at();

-- Add comment to table
COMMENT ON TABLE customers IS 'Catálogo de clientes para MECER FRESH';
COMMENT ON COLUMN customers.rfc IS 'RFC del cliente - Identificador único (formato mexicano)';
COMMENT ON COLUMN customers.payment_method IS 'Forma de pago preferida del cliente';
COMMENT ON COLUMN customers.credit_days IS 'Días de crédito permitidos al cliente (0 = al contado)';
COMMENT ON COLUMN customers.clabe IS 'Clave bancaria estandarizada (18 dígitos)';
