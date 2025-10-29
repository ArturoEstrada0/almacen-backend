import { Module } from "@nestjs/common"
import { ImportsService } from "./imports.service"
import { ImportsController } from "./imports.controller"
import { ProductsModule } from "../products/products.module"
import { WarehousesModule } from "../warehouses/warehouses.module"

@Module({
  imports: [ProductsModule, WarehousesModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
