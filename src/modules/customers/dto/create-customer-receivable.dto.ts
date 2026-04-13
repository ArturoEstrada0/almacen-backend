import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class CreateCustomerReceivableDto {
  @ApiProperty({ example: "FAC-2026-001" })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string

  @ApiProperty({ example: "2026-04-09", description: "Fecha de la venta" })
  @IsDateString()
  saleDate: string

  @ApiProperty({ example: "2026-04-09", description: "Fecha de emisión de la factura" })
  @IsDateString()
  invoiceDate: string

  @ApiPropertyOptional({ example: 30, description: "Días de crédito. Si no se envía, se toma del cliente" })
  @IsOptional()
  @IsInt()
  @Min(0)
  creditDays?: number

  @ApiProperty({ example: 12500.5 })
  @IsNumber()
  @Min(0)
  originalAmount: number

  @ApiPropertyOptional({ example: "Venta a crédito con factura asociada" })
  @IsOptional()
  @IsString()
  notes?: string
}
