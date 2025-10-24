import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"

export class CreateQuotationItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateQuotationDto {
  @ApiProperty({ example: "Cotización de insumos", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: "2024-12-31", required: false })
  @IsOptional()
  validUntil?: Date

  @ApiProperty({ type: [CreateQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[]
}
