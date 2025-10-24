import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Location } from "./location.entity"
import { InventoryItem } from "../../inventory/entities/inventory-item.entity"

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  code: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  state: string

  @Column({ name: "postal_code", nullable: true })
  postalCode: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  manager: string

  @Column({ default: true })
  active: boolean

  @OneToMany(
    () => Location,
    (location) => location.warehouse,
  )
  locations: Location[]

  @OneToMany(
    () => InventoryItem,
    (item) => item.warehouse,
  )
  inventoryItems: InventoryItem[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
