import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Producer } from "./producer.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("fruit_receptions")
export class FruitReception {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ name: "producer_id" })
  producerId: string

  @ManyToOne(() => Producer)
  @JoinColumn({ name: "producer_id" })
  producer: Producer

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ type: "date" })
  date: Date

  @Column({ type: "decimal", precision: 10, scale: 2 })
  boxes: number

  @Column({ name: "weight_per_box", type: "decimal", precision: 10, scale: 2, nullable: true })
  weightPerBox: number

  @Column({ name: "total_weight", type: "decimal", precision: 10, scale: 2, nullable: true })
  totalWeight: number

  @Column({
    name: "shipment_status",
    type: "enum",
    enum: ["pendiente", "embarcada", "vendida"],
    default: "pendiente",
  })
  shipmentStatus: "pendiente" | "embarcada" | "vendida"

  @Column({ name: "shipment_id", nullable: true })
  shipmentId: string

  @Column({ name: "price_per_box", type: "decimal", precision: 10, scale: 2, nullable: true })
  pricePerBox: number

  @Column({ name: "final_total", type: "decimal", precision: 10, scale: 2, nullable: true })
  finalTotal: number

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
