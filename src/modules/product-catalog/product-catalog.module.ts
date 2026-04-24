import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ProductCatalogController } from "./product-catalog.controller"
import { ProductCatalogService } from "./product-catalog.service"
import { ProductCatalogItem } from "./entities/product-catalog-item.entity"

@Module({
  imports: [TypeOrmModule.forFeature([ProductCatalogItem])],
  controllers: [ProductCatalogController],
  providers: [ProductCatalogService],
  exports: [TypeOrmModule],
})
export class ProductCatalogModule {}