import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm"
import { QuotationItem } from "./quotation-item.entity"
import { QuotationSupplierToken } from "./quotation-supplier-token.entity"

@Entity("quotations")
export class Quotation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: ["borrador", "pendiente", "enviada", "parcial", "completada", "cerrada", "cancelada"],
    default: "borrador",
  })
  status: "borrador" | "pendiente" | "enviada" | "parcial" | "completada" | "cerrada" | "cancelada"

  @Column({ type: "date" })
  date: Date

  @Column({ name: "valid_until", type: "date", nullable: true })
  validUntil: Date

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "winning_supplier_id", nullable: true })
  winningSupplierId: string

  @Column({ name: "purchase_order_id", nullable: true })
  purchaseOrderId: string

  @OneToMany(
    () => QuotationItem,
    (item) => item.quotation,
    { cascade: true },
  )
  items: QuotationItem[]

  @OneToMany(
    () => QuotationSupplierToken,
    (token) => token.quotation,
  )
  supplierTokens: QuotationSupplierToken[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
