import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsOptional, IsDateString, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class ReturnedItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  quantity: number

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number
}

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

  @ApiProperty({ example: "TRK-MI6CT93L-5023", required: false })
  @IsString()
  @IsOptional()
  trackingFolio?: string

  @ApiProperty({ example: "2025-11-18", required: false })
  @IsDateString()
  @IsOptional()
  date?: string

  @ApiProperty({ example: 25.5, required: false })
  @IsNumber()
  @IsOptional()
  weightPerBox?: number

  @ApiProperty({ example: 2550, required: false })
  @IsNumber()
  @IsOptional()
  totalWeight?: number

  @ApiProperty({ example: "Calidad A", required: false })
  @IsString()
  @IsOptional()
  quality?: string

  @ApiProperty({ example: "Notas de recepción", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ example: 100, description: "Cantidad de cajas devueltas por el productor", required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  returnedBoxes?: number

  @ApiProperty({ example: 500, description: "Valor del material de empaque devuelto (genera abono)", required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  returnedBoxesValue?: number

  @ApiProperty({ 
    type: [ReturnedItemDto], 
    description: "Items devueltos por el productor (insumos o materiales)", 
    required: false 
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReturnedItemDto)
  returnedItems?: ReturnedItemDto[]
}
