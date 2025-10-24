# Almacén Backend - NestJS

Backend completo del sistema de gestión de almacén construido con NestJS, TypeORM y PostgreSQL.

## Características

- **Arquitectura modular** con separación de responsabilidades
- **TypeORM** para gestión de base de datos
- **Validación automática** con class-validator
- **Documentación Swagger** en `/api/docs`
- **Manejo global de errores**
- **Transacciones** para operaciones críticas
- **Autenticación JWT** (opcional)

## Módulos Implementados

### 1. Products (Productos)
- CRUD completo de productos
- Soporte para productos tipo "insumo" y "fruta"
- Gestión de categorías y unidades de medida
- Relación con proveedores

### 2. Warehouses (Almacenes)
- Gestión de almacenes
- Ubicaciones dentro de almacenes (zonas, pasillos, estantes)
- Control de capacidad

### 3. Inventory (Inventario)
- Control de stock por almacén y ubicación
- Movimientos de inventario (entrada, salida, ajuste, traspaso)
- Actualización automática de stock
- Trazabilidad completa

### 4. Suppliers (Proveedores)
- Directorio de proveedores
- Relación producto-proveedor
- Cotizaciones
- Días de crédito

### 5. Purchase Orders (Órdenes de Compra)
- Creación de órdenes de compra
- Recepción de productos
- Actualización automática de inventario
- Estados: pendiente, parcial, completada, cancelada
- Cuentas por pagar

### 6. Producers (Productores)
- Directorio de productores
- Asignación de insumos (genera movimiento en contra)
- Recepción de fruta (sin ajuste de cuenta)
- Creación de embarques agrupando múltiples recepciones
- Venta de embarques (genera movimiento a favor)
- Estados de cuenta con balance
- Registro de pagos

## Instalación

\`\`\`bash
# Instalar dependencias
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Ejecutar migraciones
npm run migration:run

# Iniciar en desarrollo
npm run start:dev

# Iniciar en producción
npm run build
npm run start:prod
\`\`\`

## Variables de Entorno

\`\`\`env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=almacen_db

# Application
PORT=3001
NODE_ENV=development

# JWT (opcional)
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
\`\`\`

## API Endpoints

### Products
- `GET /products` - Listar productos
- `GET /products/:id` - Obtener producto
- `POST /products` - Crear producto
- `PATCH /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

### Warehouses
- `GET /warehouses` - Listar almacenes
- `GET /warehouses/:id` - Obtener almacén
- `POST /warehouses` - Crear almacén
- `PATCH /warehouses/:id` - Actualizar almacén
- `DELETE /warehouses/:id` - Eliminar almacén
- `POST /warehouses/locations` - Crear ubicación
- `GET /warehouses/locations/all` - Listar ubicaciones

### Inventory
- `GET /inventory` - Obtener inventario
- `GET /inventory/product/:productId` - Inventario por producto
- `POST /inventory/movements` - Crear movimiento
- `GET /inventory/movements` - Listar movimientos
- `GET /inventory/movements/:id` - Obtener movimiento

### Suppliers
- `GET /suppliers` - Listar proveedores
- `GET /suppliers/:id` - Obtener proveedor
- `POST /suppliers` - Crear proveedor
- `PATCH /suppliers/:id` - Actualizar proveedor
- `DELETE /suppliers/:id` - Eliminar proveedor

### Purchase Orders
- `GET /purchase-orders` - Listar órdenes
- `GET /purchase-orders/:id` - Obtener orden
- `POST /purchase-orders` - Crear orden
- `PATCH /purchase-orders/:id/receive/:itemId` - Recibir productos
- `PATCH /purchase-orders/:id/cancel` - Cancelar orden

### Producers
- `GET /producers` - Listar productores
- `GET /producers/:id` - Obtener productor
- `POST /producers` - Crear productor
- `POST /producers/input-assignments` - Asignar insumos
- `GET /producers/input-assignments/all` - Listar asignaciones
- `POST /producers/fruit-receptions` - Registrar recepción
- `GET /producers/fruit-receptions/all` - Listar recepciones
- `POST /producers/shipments` - Crear embarque
- `GET /producers/shipments/all` - Listar embarques
- `PATCH /producers/shipments/:id/status` - Actualizar estado embarque
- `GET /producers/:id/account-statement` - Estado de cuenta
- `POST /producers/payments` - Registrar pago

## Documentación Swagger

Una vez iniciado el servidor, accede a:
\`\`\`
http://localhost:3001/api/docs
\`\`\`

## Estructura del Proyecto

\`\`\`
backend/
├── src/
│   ├── modules/
│   │   ├── products/
│   │   ├── warehouses/
│   │   ├── inventory/
│   │   ├── suppliers/
│   │   ├── purchase-orders/
│   │   └── producers/
│   ├── common/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   ├── main.ts
│   └── app.module.ts
├── package.json
└── tsconfig.json
\`\`\`

## Flujo de Negocio - Productores

1. **Asignación de Insumos**
   - Se asignan insumos al productor
   - Se genera salida de almacén
   - Se crea movimiento DEBIT en cuenta (productor debe)

2. **Recepción de Fruta**
   - Se registran cajas recibidas
   - Se genera entrada a almacén
   - Status: "pendiente" (sin ajuste de cuenta)

3. **Crear Embarque**
   - Se seleccionan múltiples recepciones pendientes
   - Se agrupan en un embarque
   - Status cambia a "embarcada"

4. **Venta de Embarque**
   - Se registra precio de venta
   - Se calculan montos por productor (cajas × precio)
   - Se crean movimientos CREDIT en cuentas (les debemos)
   - Status cambia a "vendida"

5. **Pago**
   - Se registra pago al productor
   - Se crea movimiento PAYMENT
   - Se actualiza balance

## Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
\`\`\`

## Licencia

MIT
