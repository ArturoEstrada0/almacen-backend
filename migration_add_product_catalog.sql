CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS product_catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('productType', 'category')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_product_catalog_items_name_type
  ON product_catalog_items (LOWER(name), type);

INSERT INTO product_catalog_items (id, name, description, type, status)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Materiales', 'Insumos físicos', 'category', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'Herramientas', 'Equipo de trabajo', 'category', 'active'),
  ('33333333-3333-4333-8333-333333333333', 'Servicio', 'Servicio prestado', 'productType', 'active'),
  ('44444444-4444-4444-8444-444444444444', 'Consumible', 'Uso único', 'productType', 'inactive')
ON CONFLICT DO NOTHING;