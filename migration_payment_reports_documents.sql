-- Migration: Add document URLs and ISR amount to payment_reports table
-- This migration adds support for storing document URLs and ISR calculations

-- Add invoice URL column
ALTER TABLE payment_reports 
ADD COLUMN IF NOT EXISTS invoice_url VARCHAR(500);

-- Add receipt URL column
ALTER TABLE payment_reports 
ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(500);

-- Add payment complement URL column
ALTER TABLE payment_reports 
ADD COLUMN IF NOT EXISTS payment_complement_url VARCHAR(500);

-- Add ISR amount column
ALTER TABLE payment_reports 
ADD COLUMN IF NOT EXISTS isr_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN payment_reports.invoice_url IS 'URL to the invoice PDF document';
COMMENT ON COLUMN payment_reports.receipt_url IS 'URL to the receipt PDF document';
COMMENT ON COLUMN payment_reports.payment_complement_url IS 'URL to the payment complement PDF document';
COMMENT ON COLUMN payment_reports.isr_amount IS 'ISR (tax) amount deducted from payment';
