import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsInt, Min, IsPhoneNumber, ValidateIf } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { IsValidRFC, IsValidMexicoPhone, IsValidCLABE } from "../validators/custom-validators"
import { PaymentMethod } from "../entities/customer.entity"

export class CreateCustomerDto {
  @ApiProperty({ example: "ABC123456XYZ", description: "RFC del cliente (formato mexicano válido)" })
  @IsString()
  @IsNotEmpty()
  @IsValidRFC()
  rfc: string

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

  @ApiProperty({ example: "CDMX", description: "Estado" })
  @IsString()
  @IsNotEmpty()
  state: string

  @ApiProperty({ example: "06500", description: "Código Postal" })
  @IsString()
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
