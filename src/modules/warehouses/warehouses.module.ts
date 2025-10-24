import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { WarehousesService } from "./warehouses.service"
import { WarehousesController } from "./warehouses.controller"
import { Warehouse } from "./entities/warehouse.entity"
import { Location } from "./entities/location.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, Location])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService],
})
export class WarehousesModule {}
