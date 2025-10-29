-- Patch for fruit_receptions to match backend entities
-- WARNING: HAZ UN BACKUP antes de ejecutar (pg_dump)

-- 1) Crear tipo ENUM para shipment_status sólo si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fruit_reception_shipment_status') THEN
    CREATE TYPE fruit_reception_shipment_status AS ENUM ('pendiente', 'embarcada', 'vendida');
  END IF;
END$$;

-- 2) Añadir columna code (código único) si no existe
ALTER TABLE fruit_receptions
  ADD COLUMN IF NOT EXISTS code varchar;

-- 3) Backfill: si existe columna reception_number copia a code (compatibilidad)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fruit_receptions' AND column_name = 'reception_number'
  ) THEN
    UPDATE fruit_receptions
    SET code = reception_number
    WHERE (code IS NULL OR code = '') AND reception_number IS NOT NULL;
  END IF;
END$$;

-- 4) Añadir columnas relacionadas (tipo uuid). Ajusta el tipo si tu esquema usa otro
ALTER TABLE fruit_receptions
  ADD COLUMN IF NOT EXISTS producer_id uuid,
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS warehouse_id uuid,
  ADD COLUMN IF NOT EXISTS shipment_id uuid;

-- 5) Añadir columnas de datos si no existen
ALTER TABLE fruit_receptions
  ADD COLUMN IF NOT EXISTS date date,
  ADD COLUMN IF NOT EXISTS boxes numeric(10,2),
  ADD COLUMN IF NOT EXISTS weight_per_box numeric(10,2),
  ADD COLUMN IF NOT EXISTS total_weight numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_per_box numeric(10,2),
  ADD COLUMN IF NOT EXISTS final_total numeric(10,2),
  ADD COLUMN IF NOT EXISTS notes text;

-- 6) Añadir columna shipment_status usando el tipo ENUM creado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'fruit_receptions' AND column_name = 'shipment_status'
  ) THEN
    ALTER TABLE fruit_receptions
      ADD COLUMN shipment_status fruit_reception_shipment_status DEFAULT 'pendiente';
  END IF;
END$$;

-- 7) Añadir created_at / updated_at si no existen
ALTER TABLE fruit_receptions
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 8) Crear FK hacia warehouses(id), producers(id), products(id) y shipments(id) si las tablas existen y no existe la constraint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'fruit_receptions' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'warehouse_id'
    ) THEN
      ALTER TABLE fruit_receptions
        ADD CONSTRAINT fk_fruit_receptions_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'producers') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'fruit_receptions' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'producer_id'
    ) THEN
      ALTER TABLE fruit_receptions
        ADD CONSTRAINT fk_fruit_receptions_producer FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE CASCADE;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'fruit_receptions' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'product_id'
    ) THEN
      ALTER TABLE fruit_receptions
        ADD CONSTRAINT fk_fruit_receptions_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipments') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'fruit_receptions' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'shipment_id'
    ) THEN
      ALTER TABLE fruit_receptions
        ADD CONSTRAINT fk_fruit_receptions_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE SET NULL;
    END IF;
  END IF;
END$$;

-- 9) Indices útiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'ix_fruit_receptions_date'
  ) THEN
    CREATE INDEX ix_fruit_receptions_date ON fruit_receptions(date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'ix_fruit_receptions_producer_id'
  ) THEN
    CREATE INDEX ix_fruit_receptions_producer_id ON fruit_receptions(producer_id);
  END IF;
END$$;

-- 10) Defaults seguros para columnas numéricas
ALTER TABLE fruit_receptions
  ALTER COLUMN boxes SET DEFAULT 0,
  ALTER COLUMN weight_per_box SET DEFAULT 0,
  ALTER COLUMN total_weight SET DEFAULT 0,
  ALTER COLUMN price_per_box SET DEFAULT 0,
  ALTER COLUMN final_total SET DEFAULT 0;

-- Fin del patch
