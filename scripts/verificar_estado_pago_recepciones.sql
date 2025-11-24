-- Script de Prueba: Verificar actualización de payment_status en recepciones de fruta

-- 1. Ver todas las recepciones de fruta con su estado de embarque y pago
SELECT 
    fr.id,
    fr.code,
    fr.tracking_folio,
    p.name as productor,
    prod.name as producto,
    fr.boxes as cajas,
    fr.total_weight as peso_total,
    fr.shipment_status as estado_embarque,
    fr.payment_status as estado_pago,
    fr.date as fecha
FROM fruit_receptions fr
LEFT JOIN producers p ON fr.producer_id = p.id
LEFT JOIN products prod ON fr.product_id = prod.id
ORDER BY fr.date DESC
LIMIT 20;

-- 2. Ver recepciones que están vendidas pero pendientes de pago
SELECT 
    fr.id,
    fr.code,
    p.name as productor,
    prod.name as producto,
    fr.boxes as cajas,
    fr.shipment_status as estado_embarque,
    fr.payment_status as estado_pago
FROM fruit_receptions fr
LEFT JOIN producers p ON fr.producer_id = p.id
LEFT JOIN products prod ON fr.product_id = prod.id
WHERE fr.shipment_status = 'vendida' 
  AND (fr.payment_status = 'pendiente' OR fr.payment_status IS NULL)
ORDER BY fr.date DESC;

-- 3. Ver reportes de pago con sus recepciones asociadas
SELECT 
    pr.id,
    pr.code as reporte_codigo,
    pr.status as reporte_estado,
    pr.date as fecha_reporte,
    p.name as productor,
    pr.total_to_pay as total_pagar,
    COUNT(pri.id) as num_recepciones
FROM payment_reports pr
LEFT JOIN producers p ON pr.producer_id = p.id
LEFT JOIN payment_report_items pri ON pr.id = pri.payment_report_id
GROUP BY pr.id, pr.code, pr.status, pr.date, p.name, pr.total_to_pay
ORDER BY pr.date DESC
LIMIT 10;

-- 4. Ver detalles de un reporte de pago específico con sus recepciones
-- (Reemplaza 'REPORT_ID' con el ID real del reporte)
SELECT 
    pr.code as reporte_codigo,
    pr.status as reporte_estado,
    fr.code as recepcion_codigo,
    fr.tracking_folio,
    prod.name as producto,
    fr.boxes as cajas,
    pri.price_per_box as precio_por_caja,
    pri.subtotal,
    fr.shipment_status as estado_embarque,
    fr.payment_status as estado_pago
FROM payment_reports pr
JOIN payment_report_items pri ON pr.id = pri.payment_report_id
JOIN fruit_receptions fr ON pri.fruit_reception_id = fr.id
JOIN products prod ON fr.product_id = prod.id
WHERE pr.id = 'REPORT_ID'
ORDER BY fr.date DESC;

-- 5. Simulación de prueba: Actualizar manualmente una recepción a pagada
-- (Solo para pruebas, en producción esto se hace automáticamente)
-- UPDATE fruit_receptions 
-- SET payment_status = 'pagada' 
-- WHERE id = 'RECEPTION_ID';

-- 6. Verificar recepciones que ya están pagadas
SELECT 
    fr.id,
    fr.code,
    p.name as productor,
    prod.name as producto,
    fr.boxes as cajas,
    fr.shipment_status as estado_embarque,
    fr.payment_status as estado_pago,
    fr.date as fecha
FROM fruit_receptions fr
LEFT JOIN producers p ON fr.producer_id = p.id
LEFT JOIN products prod ON fr.product_id = prod.id
WHERE fr.payment_status = 'pagada'
ORDER BY fr.date DESC;

-- 7. Estadísticas de estados de pago
SELECT 
    payment_status as estado_pago,
    COUNT(*) as cantidad,
    SUM(boxes) as total_cajas,
    SUM(total_weight) as peso_total_kg
FROM fruit_receptions
GROUP BY payment_status
ORDER BY estado_pago;

-- 8. Recepciones del productor ERASMO GALLARDO VIVEROS
SELECT 
    fr.code,
    fr.tracking_folio,
    prod.name as producto,
    fr.boxes as cajas,
    fr.total_weight as peso_kg,
    fr.shipment_status as estado_embarque,
    fr.payment_status as estado_pago,
    fr.date as fecha
FROM fruit_receptions fr
JOIN producers p ON fr.producer_id = p.id
JOIN products prod ON fr.product_id = prod.id
WHERE p.name ILIKE '%ERASMO GALLARDO%'
ORDER BY fr.date DESC;
