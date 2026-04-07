import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import * as dns from 'dns'
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { DataSource } from "typeorm"
import { AppModule } from "./app.module"
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter"

async function ensureShipmentSchema(dataSource: DataSource) {
  // These columns are required for existing queries (e.g. fruit receptions -> shipment relation).
  await dataSource.query(`ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS customer_id UUID,
    ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS carrier_id UUID,
    ADD COLUMN IF NOT EXISTS carrier_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS invoice_amount DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS carrier_invoice_amount DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS invoice_registered_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS carrier_invoice_registered_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS waybill_registered_at TIMESTAMP;`)

  // The accounting table is useful, but the app can continue even if the DB user cannot create
  // extensions or if the table already exists from a prior migration.
  try {
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
    await dataSource.query(`CREATE TABLE IF NOT EXISTS shipment_accounting_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      shipment_code VARCHAR(50) NOT NULL,
      entry_type VARCHAR(30) NOT NULL,
      party_type VARCHAR(20) NOT NULL,
      party_id UUID,
      party_name VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      description TEXT NOT NULL,
      document_type VARCHAR(50),
      document_url VARCHAR(500),
      document_registered_at TIMESTAMP,
      reference_number VARCHAR(100),
      last_payment_at TIMESTAMP,
      last_payment_method VARCHAR(50),
      last_payment_reference VARCHAR(120),
      last_payment_notes TEXT,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`)
    await dataSource.query(`ALTER TABLE shipment_accounting_entries
      ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_payment_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_payment_reference VARCHAR(120),
      ADD COLUMN IF NOT EXISTS last_payment_notes TEXT;`)
    await dataSource.query(`CREATE INDEX IF NOT EXISTS idx_shipment_accounting_entries_shipment_id ON shipment_accounting_entries(shipment_id);`)
    await dataSource.query(`CREATE INDEX IF NOT EXISTS idx_shipment_accounting_entries_shipment_type ON shipment_accounting_entries(shipment_id, entry_type);`)
  } catch (err) {
    console.warn('Shipment accounting schema could not be fully initialized:', err?.message || err)
  }
}

async function bootstrap() {
  // Force DNS to prefer IPv4 addresses first to avoid ENETUNREACH when the
  // environment/container has no IPv6 connectivity (common on some PaaS).
  try {
    // setDefaultResultOrder exists on Node >= 17.3.0. It's safe to call
    // conditionally in modern Node versions (we use Node 22 on Render).
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first')
      console.log('dns: setDefaultResultOrder -> ipv4first')
    }
  } catch (err) {
    // Non-fatal: log and continue. If unavailable, we still try other remedies.
    console.warn('dns: could not set default result order:', err?.message || err)
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Global exception filter — manejo de errores + notificaciones Discord en prod
  app.useGlobalFilters(new AllExceptionsFilter())

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Enable CORS. FRONTEND_URL may contain one or more origins separated by commas.
  // When credentials are true, Access-Control-Allow-Origin must be a specific origin,
  // so we implement a small origin-checking function.
  const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:3000'
  const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean)

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow non-browser requests (e.g., curl, Postman) which have no origin
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) return callback(null, true)

      // For debugging, you can log blocked origins here
      console.warn(`CORS blocked origin: ${origin}`)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })

  // Add global API prefix so frontend can call /api/... endpoints
  app.setGlobalPrefix("api")

  // Ensure shipment-related schema exists even if the database was not migrated yet.
  try {
    await ensureShipmentSchema(app.get(DataSource))
  } catch (err) {
    console.warn('Could not ensure shipment schema:', err?.message || err)
  }

  // Serve uploaded files under /uploads
  const uploadsPath = join(__dirname, '..', 'uploads')
  try {
    app.useStaticAssets(uploadsPath, { prefix: '/uploads' })
    console.log(`Serving uploads from ${uploadsPath} at /uploads`)
  } catch (err) {
    console.warn('Could not enable static uploads serving:', err?.message || err)
  }

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Sistema de Almacén API")
    .setDescription("API completa para gestión de almacén, inventario, productores y proveedores")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("products", "Gestión de productos")
    .addTag("inventory", "Control de inventario y stock")
    .addTag("warehouses", "Gestión de almacenes")
    .addTag("suppliers", "Gestión de proveedores")
    .addTag("purchase-orders", "Órdenes de compra")
    .addTag("producers", "Gestión de productores")
    .addTag("quotations", "Cotizaciones")
    .addTag("auth", "Autenticación y autorización")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)

  // ⚠️ ENDPOINT DE PRUEBA — eliminar después de confirmar que Discord recibe el mensaje
  const httpAdapter: any = app.getHttpAdapter()
  if (httpAdapter && typeof httpAdapter.get === 'function') {
    httpAdapter.get('/debug/test-error', (_req: any, _res: any) => {
      throw new Error('🧪 Error de prueba — si ves esto en Discord, el monitor funciona correctamente.')
    })
  }

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`🚀 Backend running on: http://localhost:${port}`)
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`)
}

bootstrap()
