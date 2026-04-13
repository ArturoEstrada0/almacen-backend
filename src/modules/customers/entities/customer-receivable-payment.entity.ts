import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Customer } from "./customer.entity"
import { CustomerReceivableInvoice } from "./customer-receivable.entity"

@Entity("customer_receivable_payments")
@Index(["receivableId", "paymentDate"])
export class CustomerReceivablePayment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "receivable_id" })
  receivableId: string

  @ManyToOne(() => CustomerReceivableInvoice, (receivable) => receivable.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "receivable_id" })
  receivable: CustomerReceivableInvoice

  @Column({ name: "customer_id" })
  customerId: string

  @ManyToOne(() => Customer, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "customer_id" })
  customer: Customer

  @Column({ name: "payment_date", type: "date" })
  paymentDate: Date

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number

  @Column({ nullable: true })
  reference?: string

  @Column({ name: "captured_by_user_id", nullable: true })
  capturedByUserId?: string

  @Column({ name: "captured_by_user_name", nullable: true })
  capturedByUserName?: string

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({ name: "invoice_file_url", type: "text", nullable: true })
  invoiceFileUrl?: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
