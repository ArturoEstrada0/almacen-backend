import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProducersService } from "./producers.service"
import { ProducersController } from "./producers.controller"
import { Producer } from "./entities/producer.entity"
import { InputAssignment } from "./entities/input-assignment.entity"
import { InputAssignmentItem } from "./entities/input-assignment-item.entity"
import { FruitReception } from "./entities/fruit-reception.entity"
import { ReturnedItem } from "./entities/returned-item.entity"
import { Shipment } from "./entities/shipment.entity"
import { ProducerAccountMovement } from "./entities/producer-account-movement.entity"
import { PaymentReport } from "./entities/payment-report.entity"
import { PaymentReportItem } from "./entities/payment-report-item.entity"
import { InventoryModule } from "../inventory/inventory.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producer,
      InputAssignment,
      InputAssignmentItem,
      FruitReception,
      ReturnedItem,
      Shipment,
      ProducerAccountMovement,
      PaymentReport,
      PaymentReportItem,
    ]),
    InventoryModule,
  ],
  controllers: [ProducersController],
  providers: [ProducersService],
  exports: [ProducersService],
})
export class ProducersModule {}
