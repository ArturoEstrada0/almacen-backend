import { Transform } from "class-transformer"
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsInt, Min, ValidateIf, IsIn } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { IsValidRFC, IsValidMexicoPhone, IsValidCLABE } from "../validators/custom-validators"
import { PaymentMethod, CustomerType } from "../entities/customer.entity"

export const CUSTOMER_TYPES = [CustomerType.NATIONAL, CustomerType.FOREIGN] as const

export class CreateCustomerDto {
  @ApiProperty({ example: "CLI-0001", description: "ID de cliente" })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toUpperCase() : value))
  customerCode: string

  @ApiProperty({ enum: CUSTOMER_TYPES, default: CustomerType.NATIONAL, description: "Tipo de cliente" })
  @IsString()
  @IsNotEmpty()
  @IsIn(CUSTOMER_TYPES)
  customerType: CustomerType

  @ApiProperty({ example: "ABC123456XYZ", required: false, description: "RFC del cliente (formato mexicano válido)" })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toUpperCase() || undefined : value))
  @IsValidRFC()
  rfc?: string

  @ApiProperty({ example: "ABC Soluciones S.A. de C.V.", description: "Nombre o Razón Social" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "Distribuidora de Alimentos", required: false })
  @IsString()
  @IsOptional()
  businessType?: string

  // Dirección
  @ApiProperty({ example: "Avenida Revolución", description: "Nombre de la calle" })
  @IsString()
  @IsNotEmpty()
  street: string

  @ApiProperty({ example: "1234", description: "Número de la calle" })
  @IsString()
  @IsNotEmpty()
  streetNumber: string

  @ApiProperty({ example: "Centro", required: false, description: "Colonia o barrio" })
  @IsString()
  @IsOptional()
  neighborhood?: string

  @ApiProperty({ example: "México", description: "Ciudad" })
  @IsString()
  @IsNotEmpty()
  city: string

  @ApiProperty({ example: "CDMX", required: false, description: "Estado (obligatorio para clientes nacionales)" })
  @IsString()
  @ValidateIf((obj) => obj.customerType === CustomerType.NATIONAL)
  @IsNotEmpty()
  state: string

  @ApiProperty({ example: "México", required: false, description: "País (obligatorio para clientes extranjeros)" })
  @IsString()
  @ValidateIf((obj) => obj.customerType === CustomerType.FOREIGN)
  @IsNotEmpty()
  country?: string

  @ApiProperty({ example: "06500", required: false, description: "Código Postal (obligatorio para clientes nacionales)" })
  @IsString()
  @ValidateIf((obj) => obj.customerType === CustomerType.NATIONAL)
  @IsNotEmpty()
  postalCode: string

  // Contacto
  @ApiProperty({ example: "5551234567", description: "Teléfono (10 dígitos)" })
  @IsString()
  @IsNotEmpty()
  @IsValidMexicoPhone()
  phone: string

  @ApiProperty({ example: "contacto@abcsoluciones.com", description: "Correo electrónico" })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ example: "Juan García Morales", required: false, description: "Nombre del contacto principal" })
  @IsString()
  @IsOptional()
  contactName?: string

  // Datos de pago
  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.BANK_TRANSFER, description: "Forma de pago preferida" })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod

  @ApiProperty({ example: 30, required: false, description: "Días de crédito (0 = al contado)" })
  @IsInt()
  @Min(0)
  @IsOptional()
  creditDays?: number

  @ApiProperty({ example: "Banco del Bajío", required: false })
  @IsString()
  @IsOptional()
  bankName?: string

  @ApiProperty({ example: "123456789012345678", required: false })
  @IsString()
  @IsOptional()
  accountNumber?: string

  @ApiProperty({ example: "012580000123456789", required: false, description: "CLABE de 18 dígitos" })
  @IsString()
  @IsOptional()
  @ValidateIf((obj) => obj.clabe !== undefined && obj.clabe !== "")
  @IsValidCLABE()
  clabe?: string

  @ApiProperty({ example: "Notas especiales sobre el cliente", required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ default: true, description: "Estado del cliente (activo/inactivo)" })
  @IsOptional()
  active?: boolean
}
