-- Agregar columna tracking_folio a las tablas

-- Agregar a input_assignments (único y obligatorio)
ALTER TABLE input_assignments ADD COLUMN IF NOT EXISTS tracking_folio VARCHAR(50) UNIQUE;

-- Generar folios para registros existentes en input_assignments
UPDATE input_assignments SET tracking_folio = 'TRK-' || UPPER(TO_CHAR(NOW(), 'YYMMDDHH24MISS')) || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0') || '-' || SUBSTRING(id, 1, 4) WHERE tracking_folio IS NULL;

-- Hacer la columna NOT NULL después de llenar los valores
ALTER TABLE input_assignments ALTER COLUMN tracking_folio SET NOT NULL;

-- Agregar a fruit_receptions (nullable)
ALTER TABLE fruit_receptions ADD COLUMN IF NOT EXISTS tracking_folio VARCHAR(50);

-- Agregar a shipments (nullable)
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tracking_folio VARCHAR(50);
