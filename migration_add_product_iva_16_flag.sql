-- Agrega bandera para aplicar IVA del 16% por producto
ALTER TABLE products
ADD COLUMN IF NOT EXISTS has_iva_16 BOOLEAN NOT NULL DEFAULT true;
