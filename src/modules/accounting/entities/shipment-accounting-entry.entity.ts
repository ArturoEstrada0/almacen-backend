import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export type ShipmentAccountingEntryType = "cuenta_por_cobrar" | "cuenta_por_pagar"
export type ShipmentAccountingPartyType = "customer" | "carrier"
export type ShipmentAccountingPaymentStatus = "pendiente" | "parcial" | "pagado"

@Entity("shipment_accounting_entries")
@Index(["shipmentId", "entryType"])
@Index(["shipmentId", "partyType"])
export class ShipmentAccountingEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "shipment_id" })
  shipmentId: string

  @Column({ name: "shipment_code" })
  shipmentCode: string

  @Column({ name: "entry_type", type: "varchar", length: 30 })
  entryType: ShipmentAccountingEntryType

  @Column({ name: "party_type", type: "varchar", length: 20 })
  partyType: ShipmentAccountingPartyType

  @Column({ name: "party_id", nullable: true })
  partyId?: string

  @Column({ name: "party_name", type: "varchar", length: 255 })
  partyName: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number

  @Column({ name: "paid_amount", type: "decimal", precision: 10, scale: 2, default: 0 })
  paidAmount: number

  @Column({ name: "payment_status", type: "varchar", length: 20, default: "pendiente" })
  paymentStatus: ShipmentAccountingPaymentStatus

  @Column({ type: "text" })
  description: string

  @Column({ name: "document_type", type: "varchar", length: 50, nullable: true })
  documentType?: string

  @Column({ name: "document_url", type: "varchar", length: 500, nullable: true })
  documentUrl?: string

  @Column({ name: "document_registered_at", type: "timestamp", nullable: true })
  documentRegisteredAt?: Date

  @Column({ name: "reference_number", type: "varchar", length: 100, nullable: true })
  referenceNumber?: string

  @Column({ name: "last_payment_at", type: "timestamp", nullable: true })
  lastPaymentAt?: Date

  @Column({ name: "last_payment_method", type: "varchar", length: 50, nullable: true })
  lastPaymentMethod?: string

  @Column({ name: "last_payment_reference", type: "varchar", length: 120, nullable: true })
  lastPaymentReference?: string

  @Column({ name: "last_payment_notes", type: "text", nullable: true })
  lastPaymentNotes?: string

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}
