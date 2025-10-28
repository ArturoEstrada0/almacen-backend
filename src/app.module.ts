import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as dns from 'dns'
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
      // Make the factory async so we can resolve the DB host to an IPv4 address before returning options.
      useFactory: async (config: ConfigService) => {
  // Use hardcoded direct Supabase URL (ignore env vars) as requested.
  // NOTE: This stores credentials in source code and is insecure for production.
  const databaseUrl = 'postgresql://postgres:ItzGivenODST@db.ehpssgacrncyarzxogmv.supabase.co:5432/postgres?sslmode=require'
        const nodeEnv = config.get<string>('NODE_ENV')

        if (databaseUrl) {
          // Detect SSL requirement from either environment or the connection string query
          const sslRequestedInUrl = /sslmode=require|ssl=true/i.test(databaseUrl)
          const sslEnabled = nodeEnv === 'production' || config.get('DB_FORCE_SSL') || sslRequestedInUrl

          try {
            // Parse the URL to extract host/port/user/db
            const parsed = new URL(databaseUrl)
            const hostname = parsed.hostname
            const port = Number(parsed.port) || 5432
            const username = parsed.username
            const password = parsed.password
            const database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined

            // Try to resolve IPv4 address for the host. This avoids ENETUNREACH when the platform
            // returns an IPv6 AAAA record that is not routable from the container.
            const lookup = dns.promises.lookup
            const addr = await lookup(hostname, { family: 4 }).catch(() => null)

            if (addr && addr.address) {
              // Return explicit host-based options using the resolved IPv4 address.
              return {
                type: 'postgres',
                host: addr.address,
                port,
                username,
                password,
                database,
                ssl: sslEnabled ? { rejectUnauthorized: false } : false,
                autoLoadEntities: true,
                synchronize: nodeEnv !== 'production',
                logging: nodeEnv === 'development',
              }
            }

            // If IPv4 resolution failed, fall back to using the full URL (original behavior).
            return {
              type: 'postgres',
              url: databaseUrl,
              ssl: sslEnabled ? { rejectUnauthorized: false } : false,
              autoLoadEntities: true,
              synchronize: nodeEnv !== 'production',
              logging: nodeEnv === 'development',
            }
          } catch (err) {
            // On any parsing/lookup error, fall back to URL form to avoid blocking startup.
            return {
              type: 'postgres',
              url: databaseUrl,
              ssl: sslEnabled ? { rejectUnauthorized: false } : false,
              autoLoadEntities: true,
              synchronize: nodeEnv !== 'production',
              logging: nodeEnv === 'development',
            }
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
