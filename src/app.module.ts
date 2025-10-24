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
import { DatabaseConfig } from "./config/database.config" // This line is redundant and can be removed

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_DATABASE', 'almacen'),
        // Use autoLoadEntities so Nest/TypeORM loads entities registered via forFeature in modules
        // This avoids TypeORM trying to require .ts files directly in dev mode
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
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
