import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsArray, IsUUID, IsOptional, IsDateString } from "class-validator"

export class CreateShipmentDto {
  @ApiProperty({ example: ["uuid1", "uuid2"] })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsNotEmpty()
  receptionIds: string[]

  @ApiProperty({ example: "2025-11-18", required: false })
  @IsDateString()
  @IsOptional()
  date?: string

  @ApiProperty({ example: "Transportes ABC", required: false })
  @IsString()
  @IsOptional()
  carrier?: string

  @ApiProperty({ example: "Juan Pérez", required: false })
  @IsString()
  @IsOptional()
  driver?: string

  @ApiProperty({ example: "Notas del embarque", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
