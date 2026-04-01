import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator"

class UpdatePurchaseOrderItemDto {
  @ApiPropertyOptional({ example: "uuid" })
  @IsUUID()
  productId: string

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiPropertyOptional({ example: 50.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number

  @ApiPropertyOptional({ example: "Notas del producto" })
  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID()
  warehouseId?: string

  @ApiPropertyOptional({ example: "Notas de la orden" })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ example: "2026-04-01" })
  @IsOptional()
  @IsString()
  expectedDate?: string

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditDays?: number

  @ApiPropertyOptional({ type: [UpdatePurchaseOrderItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseOrderItemDto)
  items?: UpdatePurchaseOrderItemDto[]
}
