-- Migration: Create payment_reports and payment_report_items tables
-- Date: 2025-11-20

-- Table for payment reports to producers
CREATE TABLE IF NOT EXISTS payment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE RESTRICT,
    date VARCHAR(10) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    retention_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    retention_notes TEXT,
    total_to_pay DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagado', 'cancelado')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table for payment report items (fruit receptions included in payment)
CREATE TABLE IF NOT EXISTS payment_report_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_report_id UUID NOT NULL REFERENCES payment_reports(id) ON DELETE CASCADE,
    fruit_reception_id UUID NOT NULL REFERENCES fruit_receptions(id) ON DELETE RESTRICT,
    boxes DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price_per_box DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_reports_producer ON payment_reports(producer_id);
CREATE INDEX IF NOT EXISTS idx_payment_reports_status ON payment_reports(status);
CREATE INDEX IF NOT EXISTS idx_payment_reports_date ON payment_reports(date);
CREATE INDEX IF NOT EXISTS idx_payment_report_items_report ON payment_report_items(payment_report_id);
CREATE INDEX IF NOT EXISTS idx_payment_report_items_reception ON payment_report_items(fruit_reception_id);

COMMENT ON TABLE payment_reports IS 'Payment reports to producers for fruit receptions';
COMMENT ON TABLE payment_report_items IS 'Individual fruit receptions included in each payment report';
COMMENT ON COLUMN payment_reports.subtotal IS 'Total amount before retention';
COMMENT ON COLUMN payment_reports.retention_amount IS 'Amount retained from payment';
COMMENT ON COLUMN payment_reports.total_to_pay IS 'Final amount to pay after retention';
