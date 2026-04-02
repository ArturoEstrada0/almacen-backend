import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

@Entity("traceability_events")
@Index(["entityType", "entityId", "createdAt"])
export class TraceabilityEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "entity_type" })
  entityType: string

  @Column({ name: "entity_id" })
  entityId: string

  @Column()
  action: string

  @Column({ name: "user_id", nullable: true })
  userId?: string

  @Column({ name: "user_name", nullable: true })
  userName?: string

  @Column({ type: "text", nullable: true })
  reason?: string

  @Column({ type: "text", nullable: true })
  details?: string

  @Column({ length: 20, default: "success" })
  result: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}