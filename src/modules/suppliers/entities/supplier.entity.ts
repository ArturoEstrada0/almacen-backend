import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { ProductSupplier } from "../../products/entities/product-supplier.entity"
import { Quotation } from "../../quotations/entities/quotation.entity"

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  rfc: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  state: string

  @Column({ name: "postal_code", nullable: true })
  postalCode: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column({ name: "contact_name", nullable: true })
  contactName: string

  @Column({ name: "business_type", nullable: true })
  businessType: string

  @Column({ name: "payment_terms", default: 0 })
  paymentTerms: number

  @Column({ default: true })
  active: boolean

  // Cuenta en Pesos (MXN)
  @Column({ name: "bank_name_mxn", nullable: true })
  bankNameMxn: string

  @Column({ name: "account_number_mxn", nullable: true })
  accountNumberMxn: string

  @Column({ name: "clabe_mxn", nullable: true })
  clabeMxn: string

  // Cuenta en Dólares (USD)
  @Column({ name: "bank_name_usd", nullable: true })
  bankNameUsd: string

  @Column({ name: "account_number_usd", nullable: true })
  accountNumberUsd: string

  @Column({ name: "swift_code_usd", nullable: true })
  swiftCodeUsd: string

  @OneToMany(
    () => ProductSupplier,
    (ps) => ps.supplier,
  )
  productSuppliers: ProductSupplier[]

  @OneToMany(
    () => Quotation,
    (quotation) => quotation.supplier,
  )
  quotations: Quotation[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
