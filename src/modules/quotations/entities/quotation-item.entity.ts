import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Quotation } from "./quotation.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("quotation_items")
export class QuotationItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "quotation_id" })
  quotationId: string

  @ManyToOne(
    () => Quotation,
    (quotation) => quotation.items,
  )
  @JoinColumn({ name: "quotation_id" })
  quotation: Quotation

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  total: number

  @Column({ type: "text", nullable: true })
  notes: string
}
