import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator"

export class RegisterShipmentPayableDto {
  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  amount: number

  @ApiProperty({ example: "transferencia", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  paymentMethod?: string

  @ApiProperty({ example: "TRX-0001", required: false })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  reference?: string

  @ApiProperty({ example: "Pago parcial de flete", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
