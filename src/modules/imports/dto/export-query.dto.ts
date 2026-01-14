import { IsOptional, IsString, IsBoolean, IsDateString, IsEnum } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class ExportProductsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  format?: "xlsx" | "csv"

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeImages?: boolean
}

export class ExportInventoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  format?: "xlsx" | "csv"

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeZeroStock?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeLots?: boolean
}

export class ExportMovementsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(["entrada", "salida", "ajuste", "traspaso"])
  type?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  format?: "xlsx" | "csv"
}

export class ExportSuppliersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  format?: "xlsx" | "csv"

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeProducts?: boolean
}

export class ExportFruitReceptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  format?: "xlsx" | "csv"

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  producerId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipmentStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeReturnedItems?: boolean
}
