import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Supplier } from "../../suppliers/entities/supplier.entity"
import { QuotationItem } from "./quotation-item.entity"

@Entity("quotations")
export class Quotation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ name: "supplier_id" })
  supplierId: string

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier

  @Column({
    type: "enum",
    enum: ["pendiente", "enviada", "respondida", "ganadora", "rechazada"],
    default: "pendiente",
  })
  status: "pendiente" | "enviada" | "respondida" | "ganadora" | "rechazada"

  @Column({ type: "date" })
  date: Date

  @Column({ name: "valid_until", type: "date", nullable: true })
  validUntil: Date

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total: number

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "email_sent", default: false })
  emailSent: boolean

  @Column({ name: "email_sent_at", type: "timestamp", nullable: true })
  emailSentAt: Date

  @Column({ name: "purchase_order_id", nullable: true })
  purchaseOrderId: string

  @OneToMany(
    () => QuotationItem,
    (item) => item.quotation,
    { cascade: true },
  )
  items: QuotationItem[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
