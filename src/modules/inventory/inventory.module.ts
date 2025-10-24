import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryService } from "./inventory.service"
import { InventoryController } from "./inventory.controller"
import { InventoryItem } from "./entities/inventory-item.entity"
import { Movement } from "./entities/movement.entity"
import { MovementItem } from "./entities/movement-item.entity"
import { Warehouse } from "../warehouses/entities/warehouse.entity"

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, Movement, MovementItem, Warehouse])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
