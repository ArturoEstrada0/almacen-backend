import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsUUID, IsOptional } from "class-validator"

export class CreateLocationDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string

  @ApiProperty({ example: "Zona A" })
  @IsString()
  @IsNotEmpty()
  zone: string

  @ApiProperty({ example: "Pasillo 1", required: false })
  @IsString()
  @IsOptional()
  aisle?: string

  @ApiProperty({ example: "Estante 5", required: false })
  @IsString()
  @IsOptional()
  rack?: string

  @ApiProperty({ example: "Nivel 2", required: false })
  @IsString()
  @IsOptional()
  level?: string
}
