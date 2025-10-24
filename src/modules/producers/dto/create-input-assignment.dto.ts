import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested, IsNumber, Min } from "class-validator"
import { Type } from "class-transformer"

export class InputAssignmentItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number
}

export class CreateInputAssignmentDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  producerId: string

  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @ApiProperty({ example: "Asignación de fertilizantes", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ type: [InputAssignmentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InputAssignmentItemDto)
  items: InputAssignmentItemDto[]
}
