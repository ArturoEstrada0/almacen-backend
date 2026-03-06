import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { InputReturn } from "./input-return.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("input_return_items")
export class InputReturnItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "return_id" })
  returnId: string

  @ManyToOne(() => InputReturn, (r) => r.items)
  @JoinColumn({ name: "return_id" })
  inputReturn: InputReturn

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity: number

  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  unitPrice: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number
}
