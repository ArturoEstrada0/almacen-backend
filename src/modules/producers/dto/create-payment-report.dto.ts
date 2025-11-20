import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsOptional, IsArray, ValidateNested, IsDateString, IsEnum } from "class-validator"
import { Type } from "class-transformer"

export class PaymentReportItemDto {
  @ApiProperty({ example: "uuid-fruit-reception" })
  @IsUUID()
  @IsNotEmpty()
  fruitReceptionId: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  boxes: number

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @Min(0)
  pricePerBox: number
}

export class CreatePaymentReportDto {
  @ApiProperty({ example: "uuid-producer" })
  @IsUUID()
  @IsNotEmpty()
  producerId: string

  @ApiProperty({ example: "2025-11-20", required: false })
  @IsDateString()
  @IsOptional()
  date?: string

  @ApiProperty({ type: [PaymentReportItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentReportItemDto)
  items: PaymentReportItemDto[]

  @ApiProperty({ example: 100.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  retentionAmount?: number

  @ApiProperty({ example: "Retención por empaque", required: false })
  @IsString()
  @IsOptional()
  retentionNotes?: string

  @ApiProperty({ example: "Pago quincenal", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}

export enum PaymentReportStatus {
  PENDIENTE = "pendiente",
  PAGADO = "pagado",
  CANCELADO = "cancelado",
}

export class UpdatePaymentReportStatusDto {
  @ApiProperty({ enum: PaymentReportStatus })
  @IsEnum(PaymentReportStatus)
  @IsNotEmpty()
  status: PaymentReportStatus

  @ApiProperty({ example: "transfer", required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string

  @ApiProperty({ example: "REF-12345", required: false })
  @IsString()
  @IsOptional()
  paymentReference?: string

  @ApiProperty({ example: "Notas adicionales", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
