-- Generar folios para registros existentes en input_assignments
UPDATE input_assignments SET tracking_folio = 'TRK-' || UPPER(TO_CHAR(NOW(), 'YYMMDDHH24MISS')) || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0') || '-' || id::TEXT WHERE tracking_folio IS NULL;

-- Hacer la columna NOT NULL después de llenar los valores
ALTER TABLE input_assignments ALTER COLUMN tracking_folio SET NOT NULL;
