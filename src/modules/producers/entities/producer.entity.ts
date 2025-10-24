import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { InputAssignment } from "./input-assignment.entity"
import { FruitReception } from "./fruit-reception.entity"
import { ProducerAccountMovement } from "./producer-account-movement.entity"

@Entity("producers")
export class Producer {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  code: string

  @Column({ nullable: true })
  rfc: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  state: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column({ name: "account_balance", type: "decimal", precision: 10, scale: 2, default: 0 })
  accountBalance: number

  @Column({ default: true })
  active: boolean

  @OneToMany(
    () => InputAssignment,
    (assignment) => assignment.producer,
  )
  inputAssignments: InputAssignment[]

  @OneToMany(
    () => FruitReception,
    (reception) => reception.producer,
  )
  fruitReceptions: FruitReception[]

  @OneToMany(
    () => ProducerAccountMovement,
    (movement) => movement.producer,
  )
  accountMovements: ProducerAccountMovement[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
