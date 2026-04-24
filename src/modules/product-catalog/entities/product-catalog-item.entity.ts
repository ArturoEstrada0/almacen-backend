import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export type ProductCatalogItemType = "productType" | "category"
export type ProductCatalogItemStatus = "active" | "inactive"

@Index(["name", "type"], { unique: true })
@Entity("product_catalog_items")
export class ProductCatalogItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 150 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string | null

  @Column({ type: "varchar", length: 20 })
  type: ProductCatalogItemType

  @Column({ type: "varchar", length: 20, default: "active" })
  status: ProductCatalogItemStatus

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}