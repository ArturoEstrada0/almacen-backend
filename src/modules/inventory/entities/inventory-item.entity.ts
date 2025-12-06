import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Product } from "../../products/entities/product.entity"
import { Warehouse } from "../../warehouses/entities/warehouse.entity"

@Entity("inventory")
@Index(["productId", "warehouseId"], { unique: true })
export class InventoryItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ name: "warehouse_id" })
  warehouseId: string

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  quantity: number

  @Column({ name: "min_stock", type: "decimal", precision: 10, scale: 2, default: 0 })
  minStock: number

  @Column({ name: "max_stock", type: "decimal", precision: 10, scale: 2, default: 0 })
  maxStock: number

  @Column({ name: "reorder_point", type: "decimal", precision: 10, scale: 2, default: 0 })
  reorderPoint: number

  @Column({ name: "location_code", nullable: true })
  locationCode: string

  @Column({ name: "lot_number", nullable: true, length: 100 })
  lotNumber: string

  @Column({ name: "expiration_date", nullable: true, type: "date" })
  expirationDate: Date

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
