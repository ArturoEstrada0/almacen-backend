import { PartialType } from "@nestjs/swagger"
import { CreateProductCatalogItemDto } from "./create-product-catalog-item.dto"

export class UpdateProductCatalogItemDto extends PartialType(CreateProductCatalogItemDto) {}