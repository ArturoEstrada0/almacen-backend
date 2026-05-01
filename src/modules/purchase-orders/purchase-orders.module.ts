import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PurchaseOrdersService } from "./purchase-orders.service"
import { PurchaseOrdersController } from "./purchase-orders.controller"
import { PurchaseOrder } from "./entities/purchase-order.entity"
import { PurchaseOrderItem } from "./entities/purchase-order-item.entity"
import { PurchaseOrderPayment } from "./entities/purchase-order-payment.entity"
import { InventoryModule } from "../inventory/inventory.module"
import { TraceabilityModule } from "../traceability/traceability.module"
import { Product } from "../products/entities/product.entity"

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem, PurchaseOrderPayment, Product]), InventoryModule, TraceabilityModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
