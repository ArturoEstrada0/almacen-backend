-- Migración: Sistema de Cotizaciones Completo
-- Fecha: 2024-12-15
-- Descripción: Crea tablas para cotizaciones, tokens de proveedores y respuestas

-- Tabla principal de cotizaciones
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'borrador' CHECK (status IN ('borrador', 'pendiente', 'enviada', 'parcial', 'completada', 'cerrada', 'cancelada')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    notes TEXT,
    winning_supplier_id UUID REFERENCES suppliers(id),
    purchase_order_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items de la cotización
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(10, 2) NOT NULL,
    notes TEXT
);

-- Tokens de acceso para proveedores (acceso al portal)
CREATE TABLE IF NOT EXISTS quotation_supplier_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quotation_id, supplier_id)
);

-- Respuestas de proveedores (precios cotizados)
CREATE TABLE IF NOT EXISTS quotation_supplier_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_item_id UUID NOT NULL REFERENCES quotation_items(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN' CHECK (currency IN ('MXN', 'USD')),
    lead_time_days INTEGER,
    notes TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quotation_item_id, supplier_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(date);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_tokens_quotation ON quotation_supplier_tokens(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_tokens_supplier ON quotation_supplier_tokens(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotation_tokens_token ON quotation_supplier_tokens(token);
CREATE INDEX IF NOT EXISTS idx_quotation_responses_item ON quotation_supplier_responses(quotation_item_id);
CREATE INDEX IF NOT EXISTS idx_quotation_responses_supplier ON quotation_supplier_responses(supplier_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_quotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotations_updated_at ON quotations;
CREATE TRIGGER quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_quotations_updated_at();

-- Comentarios
COMMENT ON TABLE quotations IS 'Solicitudes de cotización enviadas a proveedores';
COMMENT ON TABLE quotation_items IS 'Productos incluidos en cada cotización';
COMMENT ON TABLE quotation_supplier_tokens IS 'Tokens de acceso únicos para que proveedores respondan cotizaciones';
COMMENT ON TABLE quotation_supplier_responses IS 'Respuestas de precios de los proveedores';
