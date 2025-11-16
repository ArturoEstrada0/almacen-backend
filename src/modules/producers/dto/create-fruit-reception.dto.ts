import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsOptional } from "class-validator"

export class CreateFruitReceptionDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  producerId: string

  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  boxes: number

  @ApiProperty({ example: 1.25, required: false })
  @IsNumber()
  @IsOptional()
  weightPerBox?: number

  @ApiProperty({ example: 125.5, required: false })
  @IsNumber()
  @IsOptional()
  totalWeight?: number

  @ApiProperty({ example: "2025-11-14", required: false })
  @IsString()
  @IsOptional()
  date?: string

  @ApiProperty({ example: "Calidad A", required: false })
  @IsString()
  @IsOptional()
  quality?: string

  @ApiProperty({ example: "Notas de recepción", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
