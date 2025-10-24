import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean } from "class-validator"

export class CreateSupplierDto {
  @ApiProperty({ example: "SUP-001" })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ example: "Proveedor ABC S.A." })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "ABC123456789" })
  @IsString()
  @IsNotEmpty()
  taxId: string

  @ApiProperty({ example: "contacto@proveedor.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: "+52 123 456 7890", required: false })
  @IsString()
  @IsOptional()
  phone?: string

  @ApiProperty({ example: "Calle Principal 123", required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ example: "Juan Pérez", required: false })
  @IsString()
  @IsOptional()
  contactName?: string

  @ApiProperty({ example: "Alimentos y bebidas", required: false })
  @IsString()
  @IsOptional()
  businessType?: string

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  creditDays?: number

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
