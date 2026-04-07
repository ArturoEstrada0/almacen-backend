-- Add shipment accounting and traceability support

ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS customer_id UUID,
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS carrier_id UUID,
  ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS invoice_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS carrier_invoice_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS invoice_registered_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS carrier_invoice_registered_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS waybill_registered_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS shipment_accounting_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  shipment_code VARCHAR(50) NOT NULL,
  entry_type VARCHAR(30) NOT NULL,
  party_type VARCHAR(20) NOT NULL,
  party_id UUID,
  party_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  description TEXT NOT NULL,
  document_type VARCHAR(50),
  document_url VARCHAR(500),
  document_registered_at TIMESTAMP,
  reference_number VARCHAR(100),
  last_payment_at TIMESTAMP,
  last_payment_method VARCHAR(50),
  last_payment_reference VARCHAR(120),
  last_payment_notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipment_accounting_entries_shipment_id ON shipment_accounting_entries(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_accounting_entries_shipment_type ON shipment_accounting_entries(shipment_id, entry_type);
