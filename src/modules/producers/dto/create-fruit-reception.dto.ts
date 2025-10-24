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

  @ApiProperty({ example: "Calidad A", required: false })
  @IsString()
  @IsOptional()
  quality?: string

  @ApiProperty({ example: "Notas de recepción", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
