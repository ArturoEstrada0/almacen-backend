import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsIn } from "class-validator"

export const SUPPLIER_TYPES = ["insumos", "fruta", "servicios", "transporte", "empaque"] as const
export type SupplierType = (typeof SUPPLIER_TYPES)[number]

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

  @ApiProperty({ example: "insumos", enum: SUPPLIER_TYPES })
  @IsString()
  @IsNotEmpty()
  @IsIn(SUPPLIER_TYPES)
  supplierType: SupplierType

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  creditDays?: number

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({ example: "BBVA Bancomer", required: false })
  @IsString()
  @IsOptional()
  bankNameMxn?: string

  @ApiProperty({ example: "1234567890", required: false })
  @IsString()
  @IsOptional()
  accountNumberMxn?: string

  @ApiProperty({ example: "012345678901234567", required: false })
  @IsString()
  @IsOptional()
  clabeMxn?: string

  @ApiProperty({ example: "Bank of America", required: false })
  @IsString()
  @IsOptional()
  bankNameUsd?: string

  @ApiProperty({ example: "9876543210", required: false })
  @IsString()
  @IsOptional()
  accountNumberUsd?: string

  @ApiProperty({ example: "BOFAUS3N", required: false })
  @IsString()
  @IsOptional()
  swiftCodeUsd?: string

}
