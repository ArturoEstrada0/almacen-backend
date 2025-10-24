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
import { Category } from "../../categories/entities/category.entity"
import { Unit } from "../../units/entities/unit.entity"
import { ProductSupplier } from "./product-supplier.entity"
import { InventoryItem } from "../../inventory/entities/inventory-item.entity"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  sku: string

  @Column()
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: ["insumo", "fruta"],
    default: "insumo",
  })
  type: "insumo" | "fruta"

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  cost: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number

  @Column({ nullable: true })
  image: string

  @Column({ nullable: true })
  barcode: string

  @Column({ default: true })
  active: boolean

  @Column({ name: "category_id", nullable: true })
  categoryId: string

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category

  @Column({ name: "unit_id", nullable: true })
  unitId: string

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: "unit_id" })
  unit: Unit

  @OneToMany(
    () => ProductSupplier,
    (ps) => ps.product,
  )
  productSuppliers: ProductSupplier[]

  @OneToMany(
    () => InventoryItem,
    (item) => item.product,
  )
  inventoryItems: InventoryItem[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
