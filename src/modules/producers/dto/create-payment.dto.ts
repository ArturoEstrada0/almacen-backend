import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsEnum, IsOptional } from "class-validator"

export enum PaymentMethod {
  CASH = "cash",
  TRANSFER = "transfer",
  CHECK = "check",
  OTHER = "other",
}

export enum AccountMovementType {
  CARGO = "cargo",
  ABONO = "abono",
  PAGO = "pago",
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

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.TRANSFER, required: false })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod

  @ApiProperty({ example: "REF-12345", required: false })
  @IsString()
  @IsOptional()
  reference?: string

  @ApiProperty({ example: "Pago parcial", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ example: AccountMovementType.PAGO, enum: AccountMovementType, required: false })
  @IsEnum(AccountMovementType)
  @IsOptional()
  type?: AccountMovementType
}
