import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Producer } from "./producer.entity"

@Entity("producer_account_movements")
export class ProducerAccountMovement {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "producer_id" })
  producerId: string

  @ManyToOne(() => Producer)
  @JoinColumn({ name: "producer_id" })
  producer: Producer

  @Column({
    type: "enum",
    enum: ["cargo", "abono", "pago"],
  })
  type: "cargo" | "abono" | "pago"

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  balance: number

  @Column({ name: "reference_type", nullable: true })
  referenceType: string

  @Column({ name: "reference_id", nullable: true })
  referenceId: string

  @Column({ name: "reference_code", nullable: true })
  referenceCode: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ name: "payment_method", nullable: true })
  paymentMethod: string

  @Column({ name: "payment_reference", nullable: true })
  paymentReference: string

  @Column({ name: "evidence_url", nullable: true })
  evidenceUrl: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
