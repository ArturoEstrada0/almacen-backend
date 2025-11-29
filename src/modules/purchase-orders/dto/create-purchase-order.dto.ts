import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"

export enum PurchaseOrderStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export class CreatePurchaseOrderItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number

  @ApiProperty({ example: "Notas del producto", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  supplierId: string

  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @ApiProperty({ example: "PO-2024-001", required: false })
  @IsString()
  @IsOptional()
  orderNumber?: string

  @ApiProperty({ example: "2024-12-31", required: false })
  @IsOptional()
  expectedDate?: Date

  @ApiProperty({ example: "Notas de la orden", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ example: 30, required: false, description: "Días de crédito para el pago" })
  @IsNumber()
  @IsOptional()
  @Min(0)
  creditDays?: number

  @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[]
}
