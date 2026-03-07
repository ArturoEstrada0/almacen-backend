-- =====================================================
-- SCRIPT DE LIMPIEZA DE DATOS TRANSACCIONALES
-- =====================================================
-- Este script elimina todos los datos transaccionales
-- pero conserva los catálogos principales:
-- - Roles/Usuarios
-- - Almacenes (y ubicaciones)
-- - Productos (incluyendo categorías y unidades)
-- - Productores
-- - Proveedores (incluyendo relación producto-proveedor)
-- =====================================================

-- Iniciar transacción para poder hacer rollback si algo falla
BEGIN;

-- =====================================================
-- 1. ELIMINAR REPORTES DE PAGO
-- =====================================================
TRUNCATE TABLE payment_report_items CASCADE;
TRUNCATE TABLE payment_reports CASCADE;

-- =====================================================
-- 2. ELIMINAR MOVIMIENTOS DE CUENTA DE PRODUCTORES
-- =====================================================
TRUNCATE TABLE producer_account_movements CASCADE;

-- =====================================================
-- 3. ELIMINAR EMBARQUES
-- =====================================================
TRUNCATE TABLE shipments CASCADE;

-- =====================================================
-- 4. ELIMINAR RECEPCIONES DE FRUTA Y DEVOLUCIONES
-- =====================================================
TRUNCATE TABLE returned_items CASCADE;
TRUNCATE TABLE fruit_receptions CASCADE;

-- =====================================================
-- 5. ELIMINAR ASIGNACIONES DE INSUMOS Y DEVOLUCIONES
-- =====================================================
TRUNCATE TABLE input_return_items CASCADE;
TRUNCATE TABLE input_returns CASCADE;
TRUNCATE TABLE input_assignment_items CASCADE;
TRUNCATE TABLE input_assignments CASCADE;

-- =====================================================
-- 6. ELIMINAR ÓRDENES DE COMPRA
-- =====================================================
TRUNCATE TABLE purchase_order_items CASCADE;
TRUNCATE TABLE purchase_orders CASCADE;

-- =====================================================
-- 7. ELIMINAR COTIZACIONES DE PROVEEDORES
-- =====================================================
TRUNCATE TABLE quotation_supplier_responses CASCADE;
TRUNCATE TABLE quotation_supplier_tokens CASCADE;
TRUNCATE TABLE quotation_items CASCADE;
TRUNCATE TABLE quotations CASCADE;

-- =====================================================
-- 8. ELIMINAR MOVIMIENTOS DE ALMACÉN E INVENTARIO
-- =====================================================
TRUNCATE TABLE movement_items CASCADE;
TRUNCATE TABLE movements CASCADE;
TRUNCATE TABLE inventory CASCADE;

-- =====================================================
-- 9. RESETEAR SALDO DE PRODUCTORES A CERO
-- =====================================================
UPDATE producers SET account_balance = 0;

-- =====================================================
-- CONFIRMAR LA TRANSACCIÓN
-- =====================================================
COMMIT;

-- =====================================================
-- RESUMEN DE LO QUE SE MANTUVO:
-- =====================================================
-- ✓ roles - Usuarios del sistema
-- ✓ warehouses - Almacenes
-- ✓ locations - Ubicaciones dentro de almacenes
-- ✓ categories - Categorías de productos
-- ✓ units - Unidades de medida
-- ✓ products - Productos/Insumos
-- ✓ producers - Productores (con saldo reseteado a 0)
-- ✓ suppliers - Proveedores
-- ✓ product_suppliers - Relación producto-proveedor
-- =====================================================

-- Verificar conteos después de la limpieza
SELECT 'Catálogos conservados:' as mensaje;
SELECT 'roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL SELECT 'warehouses', COUNT(*) FROM warehouses
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'units', COUNT(*) FROM units
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'producers', COUNT(*) FROM producers
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'product_suppliers', COUNT(*) FROM product_suppliers;

SELECT 'Datos eliminados (deben ser 0):' as mensaje;
SELECT 'inventory' as tabla, COUNT(*) as registros FROM inventory
UNION ALL SELECT 'movements', COUNT(*) FROM movements
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'fruit_receptions', COUNT(*) FROM fruit_receptions
UNION ALL SELECT 'shipments', COUNT(*) FROM shipments
UNION ALL SELECT 'input_assignments', COUNT(*) FROM input_assignments
UNION ALL SELECT 'quotations', COUNT(*) FROM quotations;
