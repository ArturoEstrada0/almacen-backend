import { IsUUID, IsNumber, IsOptional, IsString, IsBoolean, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class AddProductSupplierDto {
  @ApiProperty({ description: "UUID del proveedor" })
  @IsUUID()
  supplierId: string

  @ApiProperty({ description: "Precio del proveedor para este producto", minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number

  @ApiPropertyOptional({ description: "SKU interno del proveedor para este producto" })
  @IsOptional()
  @IsString()
  supplierSku?: string

  @ApiPropertyOptional({ description: "Días de entrega estimados", minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number

  @ApiPropertyOptional({ description: "Pedido mínimo al proveedor", minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number

  @ApiPropertyOptional({ description: "Si este es el proveedor preferido para el producto" })
  @IsOptional()
  @IsBoolean()
  preferred?: boolean
}

export class UpdateProductSupplierDto {
  @ApiPropertyOptional({ description: "Precio actualizado", minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierSku?: string

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrder?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  preferred?: boolean
}
