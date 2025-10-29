"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const dns = require("dns");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
        if (typeof dns.setDefaultResultOrder === 'function') {
            dns.setDefaultResultOrder('ipv4first');
            console.log('dns: setDefaultResultOrder -> ipv4first');
        }
    }
    catch (err) {
        console.warn('dns: could not set default result order:', err?.message || err);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:3000';
    const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            console.warn(`CORS blocked origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.setGlobalPrefix("api");
    const config = new swagger_1.DocumentBuilder()
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
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Backend running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map