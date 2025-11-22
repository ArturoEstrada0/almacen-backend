-- Crear tabla para items devueltos en recepciones de fruta
CREATE TABLE IF NOT EXISTS returned_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reception_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_returned_items_reception FOREIGN KEY (reception_id) REFERENCES fruit_receptions(id) ON DELETE CASCADE,
  CONSTRAINT fk_returned_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_returned_items_reception ON returned_items(reception_id);
CREATE INDEX IF NOT EXISTS idx_returned_items_product ON returned_items(product_id);
