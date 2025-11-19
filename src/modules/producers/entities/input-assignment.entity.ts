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
import { InputAssignmentItem } from "./input-assignment-item.entity"
import { Warehouse } from "../../warehouses/entities/warehouse.entity"

@Entity("input_assignments")
export class InputAssignment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "assignment_number", unique: true })
  code: string

  @Column({ name: "tracking_folio", unique: true })
  trackingFolio: string

  @Column({ name: "producer_id" })
  producerId: string

  @ManyToOne(() => Producer)
  @JoinColumn({ name: "producer_id" })
  producer: Producer

  @Column({ name: "assignment_date", type: "varchar", length: 10 })
  date: string

  @Column({ name: "warehouse_id", nullable: true })
  warehouseId: string

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total: number

  @Column({ type: "text", nullable: true })
  notes: string

  @OneToMany(
    () => InputAssignmentItem,
    (item) => item.assignment,
    { cascade: true },
  )
  items: InputAssignmentItem[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
