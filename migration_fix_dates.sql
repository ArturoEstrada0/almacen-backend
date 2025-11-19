-- Migración para cambiar columnas de tipo date a varchar para evitar problemas de zona horaria

-- Convertir la columna date en fruit_receptions
ALTER TABLE fruit_receptions ALTER COLUMN date TYPE VARCHAR(10) USING TO_CHAR(date, 'YYYY-MM-DD');

-- Convertir la columna assignment_date en input_assignments
ALTER TABLE input_assignments ALTER COLUMN assignment_date TYPE VARCHAR(10) USING TO_CHAR(assignment_date, 'YYYY-MM-DD');

-- Convertir la columna date en shipments
ALTER TABLE shipments ALTER COLUMN date TYPE VARCHAR(10) USING TO_CHAR(date, 'YYYY-MM-DD');
