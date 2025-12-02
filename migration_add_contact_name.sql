-- Migración: Agregar columna contact_name a la tabla producers
-- Fecha: 2025-12-02

ALTER TABLE producers 
ADD COLUMN contact_name VARCHAR(255);

COMMENT ON COLUMN producers.contact_name IS 'Nombre de la persona de contacto del productor';
