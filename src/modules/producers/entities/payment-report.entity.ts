import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Producer } from "./producer.entity"
import { PaymentReportItem } from "./payment-report-item.entity"

@Entity("payment_reports")
export class PaymentReport {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ name: "producer_id" })
  producerId: string

  @ManyToOne(() => Producer)
  @JoinColumn({ name: "producer_id" })
  producer: Producer

  @Column({ type: "varchar", length: 10 })
  date: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number

  @Column({ name: "retention_amount", type: "decimal", precision: 10, scale: 2, default: 0 })
  retentionAmount: number

  @Column({ name: "retention_notes", type: "text", nullable: true })
  retentionNotes: string

  @Column({ name: "total_to_pay", type: "decimal", precision: 10, scale: 2 })
  totalToPay: number

  @Column({
    type: "enum",
    enum: ["pendiente", "pagado", "cancelado"],
    default: "pendiente",
  })
  status: "pendiente" | "pagado" | "cancelado"

  @Column({ name: "payment_method", nullable: true })
  paymentMethod: string

  @Column({ name: "payment_reference", nullable: true })
  paymentReference: string

  @Column({ name: "paid_at", type: "timestamp", nullable: true })
  paidAt: Date

  @Column({ type: "text", nullable: true })
  notes: string

  @OneToMany(() => PaymentReportItem, (item) => item.paymentReport, { cascade: true })
  items: PaymentReportItem[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
