import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsModule } from "./modules/products/products.module"
import { CategoriesModule } from "./modules/categories/categories.module"
import { UnitsModule } from "./modules/units/units.module"
import { InventoryModule } from "./modules/inventory/inventory.module"
import { WarehousesModule } from "./modules/warehouses/warehouses.module"
import { SuppliersModule } from "./modules/suppliers/suppliers.module"
import { PurchaseOrdersModule } from "./modules/purchase-orders/purchase-orders.module"
import { ProducersModule } from "./modules/producers/producers.module"
import { QuotationsModule } from "./modules/quotations/quotations.module"
import { AuthModule } from "./modules/auth/auth.module"
import { ImportsModule } from "./modules/imports/imports.module"
// DatabaseConfig exists but we prefer to inline DATABASE_URL handling here

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL')
        const isProd = config.get('NODE_ENV') === 'production'

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            // For managed Postgres (Supabase) allow SSL and skip certificate validation
            ssl: isProd || config.get('DB_FORCE_SSL') ? { rejectUnauthorized: false } : false,
            autoLoadEntities: true,
            synchronize: !isProd,
            logging: !isProd,
          }
        }

        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT') || 5432),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'postgres'),
          database: config.get('DB_DATABASE', 'almacen'),
          autoLoadEntities: true,
          synchronize: !isProd,
          logging: !isProd,
        }
      },
    }),
    AuthModule,
    ProductsModule,
  CategoriesModule,
  UnitsModule,
    InventoryModule,
    WarehousesModule,
    SuppliersModule,
    PurchaseOrdersModule,
    ProducersModule,
    QuotationsModule,
    // Imports module handles file imports (products, warehouses...)
    ImportsModule,
  ],
})
export class AppModule {}
