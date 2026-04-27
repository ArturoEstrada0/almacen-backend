UPDATE product_catalog_items
SET name = CASE
  WHEN lower(name) = 'servicio' THEN 'Insumo'
  WHEN lower(name) = 'consumible' THEN 'Fruta'
  ELSE name
END,
description = CASE
  WHEN lower(name) = 'servicio' THEN 'Producto de entrada'
  WHEN lower(name) = 'consumible' THEN 'Producto agrícola'
  ELSE description
END,
status = CASE
  WHEN lower(name) = 'servicio' THEN 'active'
  WHEN lower(name) = 'consumible' THEN 'inactive'
  ELSE status
END
WHERE type = 'productType';