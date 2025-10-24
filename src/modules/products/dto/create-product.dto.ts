import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsUUID, Min } from "class-validator"

export class CreateProductDto {
  @ApiProperty({ example: "PROD-001", description: "SKU único del producto" })
  @IsString()
  @IsNotEmpty()
  sku: string

  @ApiProperty({ example: "Fertilizante NPK", description: "Nombre del producto" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: "Descripción detallada del producto" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ enum: ["insumo", "fruta"], example: "insumo" })
  @IsEnum(["insumo", "fruta"])
  type: "insumo" | "fruta"

  @ApiPropertyOptional({ example: 150.5, description: "Costo del producto" })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number

  @ApiPropertyOptional({ example: 200.0, description: "Precio de venta" })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number

  @ApiPropertyOptional({ description: "URL de la imagen del producto" })
  @IsString()
  @IsOptional()
  image?: string

  @ApiPropertyOptional({ description: "Código de barras" })
  @IsString()
  @IsOptional()
  barcode?: string

  @ApiPropertyOptional({ description: "ID de la categoría" })
  @IsUUID()
  @IsOptional()
  categoryId?: string

  @ApiPropertyOptional({ description: "ID de la unidad de medida" })
  @IsUUID()
  @IsOptional()
  unitId?: string

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean
}
