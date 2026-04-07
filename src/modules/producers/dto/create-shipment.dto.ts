import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional, IsDateString, IsNumber } from "class-validator"
import { Type } from "class-transformer"

export class CreateShipmentDto {
  @ApiProperty({ example: ["uuid1", "uuid2"] })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsNotEmpty()
  receptionIds: string[]

  @ApiProperty({ example: "2025-11-18", required: false })
  @IsDateString()
  @IsOptional()
  date?: string

  @ApiProperty({ example: "Transportes ABC", required: false })
  @IsString()
  @IsOptional()
  carrier?: string

  @ApiProperty({ example: "uuid-customer", required: false })
  @IsUUID("4")
  @IsOptional()
  customerId?: string

  @ApiProperty({ example: "Cliente de prueba", required: false })
  @IsString()
  @IsOptional()
  customerName?: string

  @ApiProperty({ example: "uuid-carrier", required: false })
  @IsUUID("4")
  @IsOptional()
  carrierId?: string

  @ApiProperty({ example: "Transportes ABC", required: false })
  @IsString()
  @IsOptional()
  carrierName?: string

  @ApiProperty({ example: 12000, required: false })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  invoiceAmount?: number

  @ApiProperty({ example: 2500, required: false })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  carrierInvoiceAmount?: number

  @ApiProperty({ example: "Juan Pérez", required: false })
  @IsString()
  @IsOptional()
  driver?: string

  @ApiProperty({ example: "Notas del embarque", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ example: "https://.../uploads/invoice.pdf", required: false })
  @IsString()
  @IsOptional()
  invoiceUrl?: string

  @ApiProperty({ example: "https://.../uploads/carrier_invoice.pdf", required: false })
  @IsString()
  @IsOptional()
  carrierInvoiceUrl?: string

  @ApiProperty({ example: "https://.../uploads/waybill.pdf", required: false })
  @IsString()
  @IsOptional()
  waybillUrl?: string
}
