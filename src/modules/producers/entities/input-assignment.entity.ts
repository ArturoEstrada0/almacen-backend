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

@Entity("input_assignments")
export class InputAssignment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ name: "producer_id" })
  producerId: string

  @ManyToOne(() => Producer)
  @JoinColumn({ name: "producer_id" })
  producer: Producer

  @Column({ type: "date" })
  date: Date

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
