import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { FruitReception } from "./fruit-reception.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("returned_items")
export class ReturnedItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "reception_id" })
  receptionId: string

  @ManyToOne(() => FruitReception, (reception) => reception.returnedItems)
  @JoinColumn({ name: "reception_id" })
  reception: FruitReception

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
