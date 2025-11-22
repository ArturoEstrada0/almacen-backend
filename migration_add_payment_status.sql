-- Agregar columna payment_status a fruit_receptions
ALTER TABLE fruit_receptions 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pendiente';

-- Crear tipo enum si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fruit_reception_payment_status_enum') THEN
        CREATE TYPE fruit_reception_payment_status_enum AS ENUM ('pendiente', 'pagada');
    END IF;
END$$;

-- Primero quitar el default
ALTER TABLE fruit_receptions ALTER COLUMN payment_status DROP DEFAULT;

-- Actualizar la columna para usar el enum
ALTER TABLE fruit_receptions 
ALTER COLUMN payment_status TYPE fruit_reception_payment_status_enum 
USING payment_status::fruit_reception_payment_status_enum;

-- Restaurar el default
ALTER TABLE fruit_receptions ALTER COLUMN payment_status SET DEFAULT 'pendiente'::fruit_reception_payment_status_enum;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_fruit_receptions_payment_status ON fruit_receptions(payment_status);
