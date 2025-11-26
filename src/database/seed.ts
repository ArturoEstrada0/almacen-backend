import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Conectado a la base de datos');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Crear unidades de medida
    await queryRunner.query(`
      INSERT INTO units (id, code, name, symbol, type) VALUES
      ('a0000000-0000-0000-0000-000000000001', 'UNIT', 'Unidad', 'u', 'unit'),
      ('a0000000-0000-0000-0000-000000000002', 'KG', 'Kilogramo', 'kg', 'weight'),
      ('a0000000-0000-0000-0000-000000000003', 'L', 'Litro', 'L', 'volume'),
      ('a0000000-0000-0000-0000-000000000004', 'BOX', 'Caja', 'caja', 'package')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✓ Unidades creadas');

    // Crear categorías
    await queryRunner.query(`
      INSERT INTO categories (id, name, description, code) VALUES
      ('b0000000-0000-0000-0000-000000000001', 'Electrónica', 'Productos electrónicos', 'ELEC'),
      ('b0000000-0000-0000-0000-000000000002', 'Alimentos', 'Productos alimenticios', 'ALIM'),
      ('b0000000-0000-0000-0000-000000000003', 'Oficina', 'Material de oficina', 'OFIC'),
      ('b0000000-0000-0000-0000-000000000004', 'Limpieza', 'Productos de limpieza', 'LIMP')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✓ Categorías creadas');

    // Crear almacenes
    await queryRunner.query(`
      INSERT INTO warehouses (id, code, name, address, city, active) VALUES
      ('c0000000-0000-0000-0000-000000000001', 'ALM-01', 'Almacén Central', 'Av. Industrial 123', 'Monterrey', true),
      ('c0000000-0000-0000-0000-000000000002', 'ALM-02', 'Almacén Norte', 'Calle Norte 456', 'Guadalajara', true)
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✓ Almacenes creados');

    // Crear proveedores
    await queryRunner.query(`
      INSERT INTO suppliers (id, code, business_name, email, phone, active) VALUES
      ('d0000000-0000-0000-0000-000000000001', 'PROV-001', 'Tecnología Avanzada S.A.', 'ventas@techadvance.com', '8112345678', true),
      ('d0000000-0000-0000-0000-000000000002', 'PROV-002', 'Distribuidora de Alimentos', 'contacto@alimnorte.com', '3312345678', true),
      ('d0000000-0000-0000-0000-000000000003', 'PROV-003', 'Papelería Total', 'ventas@oficintotal.com', '5512345678', true)
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✓ Proveedores creados');

    // Crear productos
    await queryRunner.query(`
      INSERT INTO products (id, sku, name, description, "categoryId", "unitId", type, cost, price, active) VALUES
      ('e0000000-0000-0000-0000-000000000001', 'LAPTOP-001', 'Laptop Dell Inspiron 15', 'Laptop Dell Inspiron 15, Intel i5', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'insumo', 12000.00, 15000.00, true),
      ('e0000000-0000-0000-0000-000000000002', 'MOUSE-001', 'Mouse Logitech', 'Mouse inalámbrico Logitech M185', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'insumo', 150.00, 250.00, true),
      ('e0000000-0000-0000-0000-000000000003', 'ARROZ-001', 'Arroz Blanco 1kg', 'Arroz blanco grano largo', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'insumo', 22.00, 35.00, true),
      ('e0000000-0000-0000-0000-000000000004', 'PAPEL-001', 'Papel Bond Carta', 'Papel bond tamaño carta, 500 hojas', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'insumo', 85.00, 120.00, true),
      ('e0000000-0000-0000-0000-000000000005', 'DETERGENTE-001', 'Detergente Líquido 1L', 'Detergente líquido para ropa', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'insumo', 35.00, 55.00, true)
      ON CONFLICT (sku) DO NOTHING;
    `);
    console.log('✓ Productos creados');

    // Crear inventario inicial
    await queryRunner.query(`
      INSERT INTO inventory (id, "productId", "warehouseId", quantity, "minStock", "maxStock", "reorderPoint") VALUES
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 25, 5, 50, 10),
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 150, 20, 200, 50),
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 500, 100, 1000, 200),
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 200, 50, 300, 80),
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 120, 60, 400, 100),
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 15, 5, 30, 10),
      (gen_random_uuid(), 'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 300, 100, 500, 150)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✓ Inventario inicial creado');

    console.log('\n✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Base de datos poblada correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
