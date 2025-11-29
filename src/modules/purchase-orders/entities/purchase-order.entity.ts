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
import { PurchaseOrderItem } from "./purchase-order-item.entity"
import { Warehouse } from "../../warehouses/entities/warehouse.entity"

@Entity("purchase_orders")
export class PurchaseOrder {
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
    enum: ["pendiente", "parcial", "completada", "cancelada"],
    default: "pendiente",
  })
  status: "pendiente" | "parcial" | "completada" | "cancelada"

  @Column({ type: "date" })
  date: Date

  @Column({ name: "expected_date", type: "date", nullable: true })
  expectedDate: Date

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  subtotal: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tax: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total: number

  @Column({ name: "payment_terms", default: 0 })
  paymentTerms: number

  @Column({ name: "due_date", type: "date", nullable: true })
  dueDate: Date

  @Column({ name: "amount_paid", type: "decimal", precision: 10, scale: 2, default: 0 })
  amountPaid: number

  @Column({
    name: "payment_status",
    type: "varchar",
    length: 20,
    default: "pendiente",
  })
  paymentStatus: "pendiente" | "parcial" | "pagado"

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "quotation_id", nullable: true })
  quotationId: string

  @OneToMany(
    () => PurchaseOrderItem,
    (item) => item.purchaseOrder,
    { cascade: true },
  )
  items: PurchaseOrderItem[]

  @Column({ name: "warehouse_id", nullable: true })
  warehouseId: string

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
