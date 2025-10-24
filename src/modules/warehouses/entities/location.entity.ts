import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Warehouse } from "./warehouse.entity"

@Entity("locations")
export class Location {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "warehouse_id" })
  warehouseId: string

  @ManyToOne(
    () => Warehouse,
    (warehouse) => warehouse.locations,
  )
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse

  @Column()
  zone: string

  @Column()
  aisle: string

  @Column()
  rack: string

  @Column()
  level: string

  @Column({ unique: true })
  code: string

  @Column({ default: true })
  active: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
