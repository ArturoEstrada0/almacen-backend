import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { PurchaseOrder } from "./purchase-order.entity"

@Entity("purchase_order_payments")
@Index(["purchaseOrderId", "paymentDate"])
export class PurchaseOrderPayment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "purchase_order_id" })
  purchaseOrderId: string

  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.payments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "purchase_order_id" })
  purchaseOrder: PurchaseOrder

  @Column({ name: "payment_date", type: "date" })
  paymentDate: Date

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number

  @Column({ nullable: true })
  reference?: string

  @Column({ type: "text", nullable: true })
  notes?: string

  @Column({ name: "invoice_file_url", type: "text", nullable: true })
  invoiceFileUrl?: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
