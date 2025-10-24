import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Product } from "./product.entity"
import { Supplier } from "../../suppliers/entities/supplier.entity"

@Entity("product_suppliers")
export class ProductSupplier {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(
    () => Product,
    (product) => product.productSuppliers,
  )
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ name: "supplier_id" })
  supplierId: string

  @ManyToOne(
    () => Supplier,
    (supplier) => supplier.productSuppliers,
  )
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number

  @Column({ name: "supplier_sku", nullable: true })
  supplierSku: string

  @Column({ name: "lead_time_days", default: 0 })
  leadTimeDays: number

  @Column({ name: "minimum_order", type: "decimal", precision: 10, scale: 2, default: 1 })
  minimumOrder: number

  @Column({ default: true })
  preferred: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
