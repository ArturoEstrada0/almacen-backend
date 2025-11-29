import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString, Min } from "class-validator"

export class RegisterPaymentDto {
  @ApiProperty({ example: 1000.0, description: "Monto del pago" })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({ example: "transferencia", required: false, description: "Método de pago" })
  @IsString()
  @IsOptional()
  paymentMethod?: string

  @ApiProperty({ example: "REF-12345", required: false, description: "Referencia del pago" })
  @IsString()
  @IsOptional()
  reference?: string

  @ApiProperty({ example: "Pago parcial", required: false, description: "Notas del pago" })
  @IsString()
  @IsOptional()
  notes?: string
}
