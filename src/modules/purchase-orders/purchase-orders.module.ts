import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PurchaseOrdersService } from "./purchase-orders.service"
import { PurchaseOrdersController } from "./purchase-orders.controller"
import { PurchaseOrder } from "./entities/purchase-order.entity"
import { PurchaseOrderItem } from "./entities/purchase-order-item.entity"
import { InventoryModule } from "../inventory/inventory.module"
import { TraceabilityModule } from "../traceability/traceability.module"

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem]), InventoryModule, TraceabilityModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
