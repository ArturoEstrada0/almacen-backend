# Backend Setup Guide

## Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo
- npm o yarn

## Instalación

1. **Navegar al directorio del backend:**
\`\`\`bash
cd backend
\`\`\`

2. **Instalar dependencias:**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno:**

Copiar el archivo `.env.example` a `.env`:
\`\`\`bash
cp .env.example .env
\`\`\`

Editar `.env` con tus credenciales:
\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=almacen

NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRATION=7d
\`\`\`

4. **Crear la base de datos:**
\`\`\`bash
psql -U postgres
CREATE DATABASE almacen;
\q
\`\`\`

5. **Ejecutar el esquema SQL:**
\`\`\`bash
psql -U postgres -d almacen -f ../database/complete-schema.sql
\`\`\`

## Ejecución

### Modo Desarrollo
\`\`\`bash
npm run start:dev
\`\`\`

El servidor estará disponible en `http://localhost:3001`
La documentación Swagger en `http://localhost:3001/api/docs`

### Modo Producción
\`\`\`bash
npm run build
npm run start:prod
\`\`\`

## Estructura del Proyecto

\`\`\`
backend/
├── src/
│   ├── modules/           # Módulos de la aplicación
│   │   ├── products/      # Gestión de productos
│   │   ├── inventory/     # Control de inventario
│   │   ├── warehouses/    # Gestión de almacenes
│   │   ├── suppliers/     # Gestión de proveedores
│   │   ├── purchase-orders/ # Órdenes de compra
│   │   ├── producers/     # Gestión de productores
│   │   ├── quotations/    # Cotizaciones
│   │   └── auth/          # Autenticación
│   ├── common/            # Utilidades compartidas
│   ├── config/            # Configuración
│   └── main.ts            # Punto de entrada
├── .env                   # Variables de entorno
└── package.json
\`\`\`

## API Endpoints

### Productos
- `GET /products` - Listar productos
- `GET /products/:id` - Obtener producto
- `POST /products` - Crear producto
- `PATCH /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

### Inventario
- `GET /inventory` - Listar inventario
- `GET /inventory/warehouse/:id` - Inventario por almacén
- `POST /inventory/movement` - Crear movimiento
- `GET /inventory/movements` - Historial de movimientos

### Almacenes
- `GET /warehouses` - Listar almacenes
- `POST /warehouses` - Crear almacén
- `GET /warehouses/:id/stock` - Stock por almacén

### Proveedores
- `GET /suppliers` - Listar proveedores
- `POST /suppliers` - Crear proveedor
- `GET /suppliers/:id/products` - Productos del proveedor

### Órdenes de Compra
- `GET /purchase-orders` - Listar órdenes
- `POST /purchase-orders` - Crear orden
- `POST /purchase-orders/:id/receive` - Recibir productos
- `POST /purchase-orders/:id/payment` - Registrar pago

### Productores
- `GET /producers` - Listar productores
- `POST /producers` - Crear productor
- `POST /producers/input-assignment` - Asignar insumos
- `POST /producers/fruit-reception` - Recibir fruta
- `POST /producers/shipment` - Crear embarque
- `GET /producers/:id/account` - Estado de cuenta

## Testing

\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
\`\`\`

## Documentación API

Una vez que el servidor esté corriendo, visita:
`http://localhost:3001/api/docs`

Aquí encontrarás la documentación completa de Swagger con todos los endpoints, modelos y ejemplos.
