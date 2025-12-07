import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ImportsService } from "./imports.service"
import { ImportsController } from "./imports.controller"
import { ProductsModule } from "../products/products.module"
import { WarehousesModule } from "../warehouses/warehouses.module"
import { Product } from "../products/entities/product.entity"
import { InventoryItem } from "../inventory/entities/inventory-item.entity"
import { Movement } from "../inventory/entities/movement.entity"
import { Supplier } from "../suppliers/entities/supplier.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, InventoryItem, Movement, Supplier]),
    ProductsModule,
    WarehousesModule,
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
