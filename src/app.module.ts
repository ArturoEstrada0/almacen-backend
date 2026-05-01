import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsModule } from "./modules/products/products.module"
import { CategoriesModule } from "./modules/categories/categories.module"
import { ProductCatalogModule } from "./modules/product-catalog/product-catalog.module"
import { UnitsModule } from "./modules/units/units.module"
import { InventoryModule } from "./modules/inventory/inventory.module"
import { WarehousesModule } from "./modules/warehouses/warehouses.module"
import { SuppliersModule } from "./modules/suppliers/suppliers.module"
import { PurchaseOrdersModule } from "./modules/purchase-orders/purchase-orders.module"
import { ProducersModule } from "./modules/producers/producers.module"
import { QuotationsModule } from "./modules/quotations/quotations.module"
import { CustomersModule } from "./modules/customers/customers.module"
import { AuthModule } from "./modules/auth/auth.module"
import { ImportsModule } from "./modules/imports/imports.module"
import { DashboardModule } from "./modules/dashboard/dashboard.module"
import { UsersModule } from "./modules/users/users.module"
import { NotificationsModule } from "./modules/notifications/notifications.module"
import { MailModule } from "./modules/mail/mail.module"
import { InvoiceImportModule } from './modules/invoice-import/invoice-import.module'
import { TraceabilityModule } from "./modules/traceability/traceability.module"
import { AccountingModule } from "./modules/accounting/accounting.module"
// DatabaseConfig exists but we prefer to inline DATABASE_URL handling here
//leonardo 
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
          const poolMax = Number(config.get('DB_POOL_MAX') || 2)
          return {
            type: 'postgres',
            url: databaseUrl,
            // For managed Postgres (Supabase) allow SSL and skip certificate validation
            ssl: isProd || config.get('DB_FORCE_SSL') ? { rejectUnauthorized: false } : false,
            extra: {
              max: poolMax,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 10000,
            },
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
          extra: {
            max: Number(config.get('DB_POOL_MAX') || 2),
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          },
          autoLoadEntities: true,
          synchronize: !isProd,
          logging: !isProd,
        }
      },
    }),
    AuthModule,
    DashboardModule,
    UsersModule,
    NotificationsModule,
    MailModule,
    TraceabilityModule,
    AccountingModule,
    ProductsModule,
    ProductCatalogModule,
    CategoriesModule,
    UnitsModule,
    InventoryModule,
    WarehousesModule,
    SuppliersModule,
    CustomersModule,
    PurchaseOrdersModule,
    ProducersModule,
    QuotationsModule,
    // Imports module handles file imports (products, warehouses...)
    ImportsModule,
    // Invoice import allows uploading XML invoices and mapping items
    InvoiceImportModule,
  ],
})
export class AppModule {}
