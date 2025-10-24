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
import { Warehouse } from "../../warehouses/entities/warehouse.entity"
import { MovementItem } from "./movement-item.entity"

@Entity("movements")
export class Movement {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({
    type: "enum",
    enum: ["entrada", "salida", "ajuste", "traspaso"],
  })
  type: "entrada" | "salida" | "ajuste" | "traspaso"

  @Column({ name: "warehouse_id" })
  warehouseId: string

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @Column({ name: "destination_warehouse_id", nullable: true })
  destinationWarehouseId: string

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "destination_warehouse_id" })
  destinationWarehouse: Warehouse

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "reference_type", nullable: true })
  referenceType: string

  @Column({ name: "reference_id", nullable: true })
  referenceId: string

  @Column({ name: "created_by", nullable: true })
  createdBy: string

  @OneToMany(
    () => MovementItem,
    (item) => item.movement,
    { cascade: true },
  )
  items: MovementItem[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
