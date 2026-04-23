import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from "class-validator"
import type { WarehouseType } from "../entities/warehouse.entity"

enum WarehouseTypeEnum {
  INSUMO = "insumo",
  FRUTA = "fruta",
}

export class CreateWarehouseDto {
  @ApiProperty({ example: "Almacén Central" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "ALM-001" })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ enum: WarehouseTypeEnum, default: WarehouseTypeEnum.INSUMO })
  @IsEnum(WarehouseTypeEnum)
  @IsOptional()
  type?: WarehouseType

  @ApiPropertyOptional({ enum: WarehouseTypeEnum, description: "Legacy alias for type" })
  @IsEnum(WarehouseTypeEnum)
  @IsOptional()
  warehouseType?: WarehouseType

  @ApiProperty({ example: "Av. Principal 123", required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ example: "Almacén principal de distribución", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({ example: true, default: true, required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean
}
