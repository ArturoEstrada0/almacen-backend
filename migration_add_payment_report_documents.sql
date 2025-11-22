-- Add document fields and ISR to payment_reports table
ALTER TABLE payment_reports
ADD COLUMN IF NOT EXISTS invoice_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS payment_complement_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS isr_amount DECIMAL(10, 2) DEFAULT 0;

COMMENT ON COLUMN payment_reports.invoice_url IS 'URL de la factura del productor';
COMMENT ON COLUMN payment_reports.receipt_url IS 'URL del comprobante de pago';
COMMENT ON COLUMN payment_reports.payment_complement_url IS 'URL del complemento de pago';
COMMENT ON COLUMN payment_reports.isr_amount IS 'Monto de ISR a descontar';
