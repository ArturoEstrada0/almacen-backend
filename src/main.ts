import { NestFactory } from "@nestjs/core"
import * as dns from 'dns'
import { ValidationPipe } from "@nestjs/common"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

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

  const app = await NestFactory.create(AppModule)

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

  // Enable CORS for Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })

  // Add global API prefix so frontend can call /api/... endpoints
  app.setGlobalPrefix("api")

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

  const port = process.env.PORT || 3001
  await app.listen(port)

  console.log(`🚀 Backend running on: http://localhost:${port}`)
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`)
}

bootstrap()
