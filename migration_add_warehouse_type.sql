-- Add warehouse description and type (insumo/fruta)
ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS description TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'warehouses_type_enum'
  ) THEN
    CREATE TYPE warehouses_type_enum AS ENUM ('insumo', 'fruta');
  END IF;
END
$$;

ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS type warehouses_type_enum NOT NULL DEFAULT 'insumo';

UPDATE warehouses
SET type = 'insumo'
WHERE type IS NULL;
