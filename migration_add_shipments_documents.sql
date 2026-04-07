-- Migration: Add document URL columns to shipments table

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS invoice_url VARCHAR(500);

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS carrier_invoice_url VARCHAR(500);

ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS waybill_url VARCHAR(500);

COMMENT ON COLUMN shipments.invoice_url IS 'URL to the shipment invoice (PDF/XML)';
COMMENT ON COLUMN shipments.carrier_invoice_url IS 'URL to the carrier invoice (PDF/XML)';
COMMENT ON COLUMN shipments.waybill_url IS 'URL to the complementary waybill/document (PDF/XML)';
