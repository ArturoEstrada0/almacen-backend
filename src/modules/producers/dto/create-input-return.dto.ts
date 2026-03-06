import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from "class-validator"
import { Type } from "class-transformer"

export class InputReturnItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number
}

export class CreateInputReturnDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  producerId: string

  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @ApiProperty({ example: "2025-11-18", required: false })
  @IsDateString()
  @IsOptional()
  date?: string

  @ApiProperty({ example: "251119-456", required: false })
  @IsString()
  @IsOptional()
  trackingFolio?: string

  @ApiProperty({ example: "Devolución por empaque dañado", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ example: "Excedente/No utilizado", required: false })
  @IsString()
  @IsOptional()
  reason?: string

  @ApiProperty({ type: [InputReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InputReturnItemDto)
  items: InputReturnItemDto[]
}
