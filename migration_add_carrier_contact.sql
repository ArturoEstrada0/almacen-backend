-- Migration: Add carrier_contact field to shipments table
-- Date: 2025-11-20

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS carrier_contact VARCHAR(255);

COMMENT ON COLUMN shipments.carrier_contact IS 'Contact information (phone/email) for the carrier/driver';
