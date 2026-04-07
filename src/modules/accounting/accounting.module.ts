import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ShipmentAccountingEntry } from "./entities/shipment-accounting-entry.entity"
import { AccountingService } from "./accounting.service"
import { AccountingController } from "./accounting.controller"
import { Shipment } from "../producers/entities/shipment.entity"

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentAccountingEntry, Shipment])],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
