-- Agregar columna payment_status a purchase_orders
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pendiente';

-- Actualizar payment_status basado en amount_paid
UPDATE purchase_orders
SET payment_status = CASE
  WHEN amount_paid >= total THEN 'pagado'
  WHEN amount_paid > 0 THEN 'parcial'
  ELSE 'pendiente'
END;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);
