"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const products_module_1 = require("./modules/products/products.module");
const categories_module_1 = require("./modules/categories/categories.module");
const units_module_1 = require("./modules/units/units.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const warehouses_module_1 = require("./modules/warehouses/warehouses.module");
const suppliers_module_1 = require("./modules/suppliers/suppliers.module");
const purchase_orders_module_1 = require("./modules/purchase-orders/purchase-orders.module");
const producers_module_1 = require("./modules/producers/producers.module");
const quotations_module_1 = require("./modules/quotations/quotations.module");
const auth_module_1 = require("./modules/auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const databaseUrl = config.get('DATABASE_URL');
                    const nodeEnv = config.get('NODE_ENV');
                    if (databaseUrl) {
                        const sslRequestedInUrl = /sslmode=require|ssl=true/i.test(databaseUrl);
                        const sslEnabled = nodeEnv === 'production' || config.get('DB_FORCE_SSL') || sslRequestedInUrl;
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            ssl: sslEnabled ? { rejectUnauthorized: false } : false,
                            autoLoadEntities: true,
                            synchronize: nodeEnv !== 'production',
                            logging: nodeEnv === 'development',
                        };
                    }
                    return {
                        type: 'postgres',
                        host: config.get('DB_HOST', 'localhost'),
                        port: Number(config.get('DB_PORT', 5432)),
                        username: config.get('DB_USERNAME', 'postgres'),
                        password: config.get('DB_PASSWORD', 'postgres'),
                        database: config.get('DB_DATABASE', 'almacen'),
                        autoLoadEntities: true,
                        synchronize: nodeEnv !== 'production',
                        logging: nodeEnv === 'development',
                    };
                },
            }),
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            units_module_1.UnitsModule,
            inventory_module_1.InventoryModule,
            warehouses_module_1.WarehousesModule,
            suppliers_module_1.SuppliersModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            producers_module_1.ProducersModule,
            quotations_module_1.QuotationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map