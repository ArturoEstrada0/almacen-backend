import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ImportsService } from "./imports.service"
import { ImportsController } from "./imports.controller"
import { ProductsModule } from "../products/products.module"
import { WarehousesModule } from "../warehouses/warehouses.module"
import { ProducersModule } from "../producers/producers.module"
import { Product } from "../products/entities/product.entity"
import { InventoryItem } from "../inventory/entities/inventory-item.entity"
import { Movement } from "../inventory/entities/movement.entity"
import { Supplier } from "../suppliers/entities/supplier.entity"
import { Producer } from "../producers/entities/producer.entity"
import { InputAssignment } from "../producers/entities/input-assignment.entity"
import { InputAssignmentItem } from "../producers/entities/input-assignment-item.entity"
import { FruitReception } from "../producers/entities/fruit-reception.entity"
import { Warehouse } from "../warehouses/entities/warehouse.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, 
      InventoryItem, 
      Movement, 
      Supplier,
      Producer,
      InputAssignment,
      InputAssignmentItem,
      FruitReception,
      Warehouse,
    ]),
    ProductsModule,
    WarehousesModule,
    ProducersModule,
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
