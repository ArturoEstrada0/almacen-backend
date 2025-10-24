import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsEmail } from "class-validator"

export class CreateProducerDto {
  @ApiProperty({ example: "Juan Pérez" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "PROD-001" })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ example: "juan@example.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: "+52 123 456 7890", required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ example: "Rancho La Esperanza", required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ example: "RFC123456789", required: false })
  @IsString()
  @IsOptional()
  taxId?: string
}
