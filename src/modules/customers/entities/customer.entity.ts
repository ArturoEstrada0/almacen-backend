import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CHECK = "check",
  CREDIT = "credit",
}

export enum CustomerType {
  NATIONAL = "nacional",
  FOREIGN = "extranjero",
}

@Entity("customers")
@Index(["customerCode"], { unique: true })
@Index(["rfc"], { unique: true })
@Index(["email"])
@Index(["name"])
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string

  // Identificación
  @Column({ name: "customer_code", unique: true, nullable: true })
  customerCode: string

  @Column({ unique: true, nullable: true })
  rfc?: string

  @Column({ name: "customer_type", type: "varchar", length: 20, default: CustomerType.NATIONAL })
  customerType: CustomerType

  @Column()
  name: string

  @Column({ name: "business_type", nullable: true })
  businessType?: string

  // Dirección
  @Column()
  street: string

  @Column({ name: "street_number" })
  streetNumber: string

  @Column({ nullable: true })
  neighborhood?: string

  @Column()
  city: string

  @Column({ nullable: true })
  state: string

  @Column({ name: "country", default: "México" })
  country: string

  @Column({ name: "postal_code", nullable: true })
  postalCode: string

  @Column({ name: "full_address", type: "text", nullable: true })
  fullAddress?: string

  // Contacto
  @Column()
  phone: string

  @Column()
  email: string

  @Column({ name: "contact_name", nullable: true })
  contactName?: string

  // Datos de pago
  @Column({ name: "payment_method", type: "enum", enum: PaymentMethod, enumName: "payment_method", default: PaymentMethod.BANK_TRANSFER })
  paymentMethod: PaymentMethod

  @Column({ name: "credit_days", type: "int", default: 0 })
  creditDays: number // Días de crédito (0 = al contado)

  @Column({ name: "bank_name", nullable: true })
  bankName?: string

  @Column({ name: "account_number", nullable: true })
  accountNumber?: string

  @Column({ nullable: true })
  clabe?: string // Solo se guarda si paymentMethod es BANK_TRANSFER

  // Estado
  @Column({ default: true })
  active: boolean

  @Column({ type: "text", nullable: true })
  notes?: string

  // Información de auditoría
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
