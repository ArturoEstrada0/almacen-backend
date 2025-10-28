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
// DatabaseConfig exists in the project but AppModule opts to read envs directly here.

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
  // Use hardcoded direct Supabase URL (ignore env vars) as requested.
  // NOTE: This stores credentials in source code and is insecure for production.
  const databaseUrl = 'postgresql://postgres:ItzGivenODST@db.ehpssgacrncyarzxogmv.supabase.co:5432/postgres?sslmode=require'
        const nodeEnv = config.get<string>('NODE_ENV')

        if (databaseUrl) {
          // Detect SSL requirement from either environment or the connection string query
          const sslRequestedInUrl = /sslmode=require|ssl=true/i.test(databaseUrl)
          const sslEnabled = nodeEnv === 'production' || config.get('DB_FORCE_SSL') || sslRequestedInUrl
          // NOTE: connection info determined from DATABASE_URL (password not logged)

          return {
            type: 'postgres',
            url: databaseUrl,
            // Enable SSL when appropriate; many managed DBs require it. Accept self-signed certs by default.
            ssl: sslEnabled ? { rejectUnauthorized: false } : false,
            autoLoadEntities: true,
            synchronize: nodeEnv !== 'production',
            logging: nodeEnv === 'development',
          }
        }

        // Fallback to individual DB_* env vars (useful for local dev)
        return {
          type: 'postgres',
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 5432)),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'postgres'),
          database: config.get('DB_DATABASE', 'almacen'),
          // no debug logging here
          autoLoadEntities: true,
          synchronize: nodeEnv !== 'production',
          logging: nodeEnv === 'development',
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
  ],
})
export class AppModule {}
