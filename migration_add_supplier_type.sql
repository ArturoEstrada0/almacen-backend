-- Add supplier_type to suppliers and enforce allowed values
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS supplier_type VARCHAR(30);

UPDATE suppliers
SET supplier_type = 'insumos'
WHERE supplier_type IS NULL OR TRIM(supplier_type) = '';

ALTER TABLE suppliers
ALTER COLUMN supplier_type SET DEFAULT 'insumos';

ALTER TABLE suppliers
ALTER COLUMN supplier_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_suppliers_supplier_type'
  ) THEN
    ALTER TABLE suppliers
    ADD CONSTRAINT chk_suppliers_supplier_type
    CHECK (supplier_type IN ('insumos', 'fruta', 'servicios', 'transporte', 'empaque'));
  END IF;
END $$;
