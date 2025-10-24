import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { Product } from "./entities/product.entity"
import { ProductSupplier } from "./entities/product-supplier.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductSupplier])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
