import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { FruitReception } from "./fruit-reception.entity"

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  code: string

  @Column({ name: "tracking_folio", nullable: true })
  trackingFolio: string

  @Column({ type: "varchar", length: 10 })
  date: string

  @Column({
    type: "enum",
    enum: ["embarcada", "en-transito", "recibida", "vendida"],
    default: "embarcada",
  })
  status: "embarcada" | "en-transito" | "recibida" | "vendida"

  @Column({ name: "total_boxes", type: "decimal", precision: 10, scale: 2, default: 0 })
  totalBoxes: number

  @Column({ nullable: true })
  carrier: string

  @Column({ name: "customer_id", nullable: true })
  customerId: string

  @Column({ name: "customer_name", nullable: true })
  customerName: string

  @Column({ name: "carrier_id", nullable: true })
  carrierId: string

  @Column({ name: "carrier_name", nullable: true })
  carrierName: string

  @Column({ name: "invoice_amount", type: "decimal", precision: 10, scale: 2, nullable: true })
  invoiceAmount: number

  @Column({ name: "carrier_invoice_amount", type: "decimal", precision: 10, scale: 2, nullable: true })
  carrierInvoiceAmount: number

  @Column({ name: "carrier_contact", nullable: true })
  carrierContact: string

  @Column({ name: "shipped_at", type: "timestamp", nullable: true })
  shippedAt: Date

  @Column({ name: "received_at", type: "timestamp", nullable: true })
  receivedAt: Date

  @Column({ name: "sale_price_per_box", type: "decimal", precision: 10, scale: 2, nullable: true })
  salePricePerBox: number

  @Column({ name: "total_sale", type: "decimal", precision: 10, scale: 2, nullable: true })
  totalSale: number

  @Column({ type: "text", nullable: true })
  notes: string

  @OneToMany(
    () => FruitReception,
    (reception) => reception.shipment,
  )
  receptions: FruitReception[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ name: "invoice_url", type: "varchar", length: 500, nullable: true })
  invoiceUrl: string

  @Column({ name: "invoice_registered_at", type: "timestamp", nullable: true })
  invoiceRegisteredAt: Date

  @Column({ name: "carrier_invoice_url", type: "varchar", length: 500, nullable: true })
  carrierInvoiceUrl: string

  @Column({ name: "carrier_invoice_registered_at", type: "timestamp", nullable: true })
  carrierInvoiceRegisteredAt: Date

  @Column({ name: "waybill_url", type: "varchar", length: 500, nullable: true })
  waybillUrl: string

  @Column({ name: "waybill_registered_at", type: "timestamp", nullable: true })
  waybillRegisteredAt: Date
}
