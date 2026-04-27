-- Sincroniza categorías activas del catálogo hacia la tabla categories
-- para asegurar que products.category_id siempre apunte a un registro válido.

INSERT INTO categories (name, created_at, updated_at)
SELECT pci.name, NOW(), NOW()
FROM product_catalog_items pci
LEFT JOIN categories c
  ON LOWER(TRIM(c.name)) = LOWER(TRIM(pci.name))
WHERE pci.type = 'category'
  AND pci.status = 'active'
  AND c.id IS NULL;
