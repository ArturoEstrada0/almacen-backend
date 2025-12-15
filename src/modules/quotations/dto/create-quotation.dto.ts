import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from "class-validator"
import { Type } from "class-transformer"

export class CreateQuotationItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0.01)
  quantity: number

  @ApiProperty({ example: "Especificaciones adicionales", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}

export class CreateQuotationDto {
  @ApiProperty({ example: "Cotización de insumos para producción", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: "2024-12-31" })
  @IsDateString()
  validUntil: string

  @ApiProperty({ example: "Notas adicionales para proveedores", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ type: [CreateQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[]

  @ApiProperty({ 
    example: ["supplier-uuid-1", "supplier-uuid-2"], 
    description: "Lista de IDs de proveedores a los que se enviará la cotización"
  })
  @IsArray()
  @IsUUID("4", { each: true })
  supplierIds: string[]
}
