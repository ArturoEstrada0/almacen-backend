import { PartialType, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsUUID, Min } from "class-validator"
import { CreateProductDto } from "./create-product.dto"

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ example: 100, description: "Stock actual a actualizar en el almacén" })
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentStock?: number

  @ApiPropertyOptional({ description: "ID del almacén donde actualizar el stock" })
  @IsUUID()
  @IsOptional()
  warehouseId?: string
}
