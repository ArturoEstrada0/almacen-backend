import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CustomersService } from "./customers.service"
import { CustomersController } from "./customers.controller"
import { Customer } from "./entities/customer.entity"
import { CustomerReceivableInvoice } from "./entities/customer-receivable.entity"
import { CustomerReceivablePayment } from "./entities/customer-receivable-payment.entity"
import { TraceabilityModule } from "../traceability/traceability.module"

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerReceivableInvoice, CustomerReceivablePayment]), TraceabilityModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
