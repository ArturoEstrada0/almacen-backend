import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Movement } from "./movement.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("movement_items")
export class MovementItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "movement_id" })
  movementId: string

  @ManyToOne(
    () => Movement,
    (movement) => movement.items,
  )
  @JoinColumn({ name: "movement_id" })
  movement: Movement

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  cost: number

  @Column({ type: "text", nullable: true })
  notes: string
}
