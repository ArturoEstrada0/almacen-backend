import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SuppliersService } from "./suppliers.service"
import { SuppliersController } from "./suppliers.controller"
import { Supplier } from "./entities/supplier.entity"
import { TraceabilityModule } from "../traceability/traceability.module"

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]), TraceabilityModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
