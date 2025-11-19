import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsEnum, IsOptional, IsArray, ValidateNested, IsObject } from "class-validator"
import { Type } from "class-transformer"

export enum PaymentMethod {
  CASH = "cash",
  TRANSFER = "transfer",
  CHECK = "check",
  OTHER = "other",
}

export class RetentionDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  amount: number

  @ApiProperty({ example: "Retención por daños" })
  @IsString()
  @IsOptional()
  notes?: string
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

  @ApiProperty({ 
    type: [String], 
    example: ["uuid1", "uuid2"], 
    required: false,
    description: "IDs de los movimientos específicos que este pago cubre"
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  selectedMovements?: string[]

  @ApiProperty({ 
    type: RetentionDto,
    required: false,
    description: "Información de la retención aplicada al pago"
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RetentionDto)
  @IsOptional()
  retention?: RetentionDto
}
