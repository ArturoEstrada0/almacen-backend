import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { QuotationsService } from "./quotations.service"
import { QuotationsController } from "./quotations.controller"
import { Quotation } from "./entities/quotation.entity"
import { QuotationItem } from "./entities/quotation-item.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Quotation, QuotationItem])],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
