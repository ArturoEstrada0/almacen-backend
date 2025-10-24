import { ApiProperty } from "@nestjs/swagger"
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from "class-validator"
import { Type } from "class-transformer"

export enum MovementType {
  ENTRADA = "entrada",
  SALIDA = "salida",
  AJUSTE = "ajuste",
  TRASPASO = "traspaso",
}

export class CreateMovementItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ example: "uuid", required: false })
  @IsUUID()
  @IsOptional()
  locationId?: string

  @ApiProperty({ example: "Notas adicionales", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}

export class CreateMovementDto {
  @ApiProperty({ enum: MovementType, example: MovementType.ENTRADA })
  @IsEnum(MovementType)
  @IsNotEmpty()
  type: MovementType

  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @ApiProperty({ example: "uuid", required: false })
  @IsUUID()
  @IsOptional()
  destinationWarehouseId?: string

  @ApiProperty({ example: "Recepción de mercancía", required: false })
  @IsString()
  @IsOptional()
  reference?: string

  @ApiProperty({ example: "Notas del movimiento", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ type: [CreateMovementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMovementItemDto)
  items: CreateMovementItemDto[]
}
