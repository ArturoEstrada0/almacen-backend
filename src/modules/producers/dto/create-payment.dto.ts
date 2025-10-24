import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsEnum, IsOptional } from "class-validator"

export enum PaymentMethod {
  CASH = "cash",
  TRANSFER = "transfer",
  CHECK = "check",
  OTHER = "other",
}

export class CreatePaymentDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  producerId: string

  @ApiProperty({ example: 1000.0 })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.TRANSFER })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod

  @ApiProperty({ example: "REF-12345", required: false })
  @IsString()
  @IsOptional()
  reference?: string

  @ApiProperty({ example: "Pago parcial", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
