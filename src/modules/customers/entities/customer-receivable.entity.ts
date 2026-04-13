import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm"
import { Customer } from "./customer.entity"
import { CustomerReceivablePayment } from "./customer-receivable-payment.entity"

export type CustomerReceivableStatus = "pendiente" | "parcial" | "pagada" | "vencida"

@Entity("customer_receivables")
@Index(["customerId", "invoiceNumber"], { unique: true })
@Index(["customerId", "status"])
@Index(["dueDate"])
export class CustomerReceivableInvoice {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "customer_id" })
  customerId: string

  @ManyToOne(() => Customer, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "customer_id" })
  customer: Customer

  @Column({ name: "invoice_number" })
  invoiceNumber: string

  @Column({ name: "sale_date", type: "date" })
  saleDate: Date

  @Column({ name: "invoice_date", type: "date" })
  invoiceDate: Date

  @Column({ name: "credit_days", type: "int", default: 0 })
  creditDays: number

  @Column({ name: "due_date", type: "date" })
  dueDate: Date

  @Column({ name: "original_amount", type: "decimal", precision: 12, scale: 2 })
  originalAmount: number

  @Column({ name: "paid_amount", type: "decimal", precision: 12, scale: 2, default: 0 })
  paidAmount: number

  @Column({ name: "balance_amount", type: "decimal", precision: 12, scale: 2 })
  balanceAmount: number

  @Column({ type: "varchar", length: 20, default: "pendiente" })
  status: CustomerReceivableStatus

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({ name: "created_by_user_id", nullable: true })
  createdByUserId?: string

  @Column({ name: "created_by_user_name", nullable: true })
  createdByUserName?: string

  @Column({ name: "last_payment_at", type: "timestamp", nullable: true })
  lastPaymentAt?: Date

  @Column({ name: "last_payment_reference", nullable: true })
  lastPaymentReference?: string

  @OneToMany(() => CustomerReceivablePayment, (payment) => payment.receivable, {
    cascade: true,
  })
  payments?: CustomerReceivablePayment[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
