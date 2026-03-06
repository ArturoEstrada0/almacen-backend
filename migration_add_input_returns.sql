-- Crear tabla para devoluciones de insumos (input_returns)
CREATE TABLE IF NOT EXISTS input_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number VARCHAR(255) UNIQUE NOT NULL,
  tracking_folio VARCHAR(255) UNIQUE NOT NULL,
  producer_id UUID NOT NULL,
  return_date VARCHAR(10) NOT NULL,
  warehouse_id UUID,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_input_returns_producer FOREIGN KEY (producer_id) REFERENCES producers(id),
  CONSTRAINT fk_input_returns_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX IF NOT EXISTS idx_input_returns_producer ON input_returns(producer_id);
CREATE INDEX IF NOT EXISTS idx_input_returns_warehouse ON input_returns(warehouse_id);

-- Crear tabla para items de devoluciones (input_return_items)
CREATE TABLE IF NOT EXISTS input_return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_input_return_items_return FOREIGN KEY (return_id) REFERENCES input_returns(id) ON DELETE CASCADE,
  CONSTRAINT fk_input_return_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_input_return_items_return ON input_return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_input_return_items_product ON input_return_items(product_id);
