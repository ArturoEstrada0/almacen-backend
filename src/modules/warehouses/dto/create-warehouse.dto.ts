import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator"

export class CreateWarehouseDto {
  @ApiProperty({ example: "Almacén Central" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "ALM-001" })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ example: "Av. Principal 123", required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ example: "Almacén principal de distribución", required: false })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
