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
import { Producer } from "./producer.entity"
import { Product } from "../../products/entities/product.entity"
import { Shipment } from "./shipment.entity"
import { Warehouse } from "../../warehouses/entities/warehouse.entity"
import { ReturnedItem } from "./returned-item.entity"

@Entity("fruit_receptions")
export class FruitReception {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ name: "tracking_folio", nullable: true })
  trackingFolio: string

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

  @Column({ name: "warehouse_id" })
  warehouseId: string

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @Column({ type: "varchar", length: 10 })
  date: string

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

  @ManyToOne(() => Shipment, (shipment) => shipment.receptions, { nullable: true })
  @JoinColumn({ name: "shipment_id" })
  shipment: Shipment

  @Column({ name: "price_per_box", type: "decimal", precision: 10, scale: 2, nullable: true })
  pricePerBox: number

  @Column({ name: "final_total", type: "decimal", precision: 10, scale: 2, nullable: true })
  finalTotal: number

  // Material de empaque devuelto
  @Column({ name: "returned_boxes", type: "decimal", precision: 10, scale: 2, nullable: true, default: 0 })
  returnedBoxes: number

  @Column({ name: "returned_boxes_value", type: "decimal", precision: 10, scale: 2, nullable: true, default: 0 })
  returnedBoxesValue: number

  @OneToMany(() => ReturnedItem, (item) => item.reception, { cascade: true })
  returnedItems: ReturnedItem[]

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
