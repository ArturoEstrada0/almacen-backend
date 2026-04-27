import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"
import type { ProductCatalogItemStatus, ProductCatalogItemType } from "../entities/product-catalog-item.entity"

export class CreateProductCatalogItemDto {
  @ApiProperty({ example: "Materiales" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string

  @ApiPropertyOptional({ example: "Insumos físicos" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ enum: ["productType", "category"], example: "category" })
  @IsEnum(["productType", "category"])
  type: ProductCatalogItemType

  @ApiPropertyOptional({ enum: ["active", "inactive"], example: "active" })
  @IsEnum(["active", "inactive"])
  @IsOptional()
  status?: ProductCatalogItemStatus
}