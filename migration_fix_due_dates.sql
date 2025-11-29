-- Actualizar las fechas de vencimiento de órdenes de compra existentes
-- Si dueDate es null, calcularlo como fecha de orden + paymentTerms días

UPDATE purchase_orders
SET due_date = date + (COALESCE(payment_terms, 0) * INTERVAL '1 day')
WHERE due_date IS NULL OR due_date < '1970-01-02';

-- También actualizar paymentTerms para órdenes que tienen 0 días
UPDATE purchase_orders
SET payment_terms = 30,
    due_date = date + (30 * INTERVAL '1 day')
WHERE payment_terms = 0 OR payment_terms IS NULL;
