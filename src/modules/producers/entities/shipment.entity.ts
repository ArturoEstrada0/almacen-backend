import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { FruitReception } from "./fruit-reception.entity"

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ type: "date" })
  date: Date

  @Column({
    type: "enum",
    enum: ["embarcada", "recibida", "vendida"],
    default: "embarcada",
  })
  status: "embarcada" | "recibida" | "vendida"

  @Column({ name: "total_boxes", type: "decimal", precision: 10, scale: 2, default: 0 })
  totalBoxes: number

  @Column({ nullable: true })
  carrier: string

  @Column({ name: "shipped_at", type: "timestamp", nullable: true })
  shippedAt: Date

  @Column({ name: "received_at", type: "timestamp", nullable: true })
  receivedAt: Date

  @Column({ name: "sale_price_per_box", type: "decimal", precision: 10, scale: 2, nullable: true })
  salePricePerBox: number

  @Column({ name: "total_sale", type: "decimal", precision: 10, scale: 2, nullable: true })
  totalSale: number

  @Column({ type: "text", nullable: true })
  notes: string

  @OneToMany(
    () => FruitReception,
    (reception) => reception.shipment,
  )
  receptions: FruitReception[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
