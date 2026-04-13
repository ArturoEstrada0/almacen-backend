import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator"

export class RegisterCustomerReceivablePaymentDto {
  @ApiProperty({ example: "2026-04-10" })
  @IsDateString()
  paymentDate: string

  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({ example: "TRANSFERENCIA SPEI" })
  @IsString()
  @IsNotEmpty()
  reference: string

  @ApiPropertyOptional({ example: "Abono parcial" })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiPropertyOptional({ example: "https://.../storage/v1/object/public/customer-payments/file.pdf" })
  @IsOptional()
  @IsString()
  invoiceFileUrl?: string
}
