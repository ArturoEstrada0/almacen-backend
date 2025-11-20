import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { PaymentReport } from "./payment-report.entity"
import { FruitReception } from "./fruit-reception.entity"

@Entity("payment_report_items")
export class PaymentReportItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "payment_report_id" })
  paymentReportId: string

  @ManyToOne(() => PaymentReport, (report) => report.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "payment_report_id" })
  paymentReport: PaymentReport

  @Column({ name: "fruit_reception_id" })
  fruitReceptionId: string

  @ManyToOne(() => FruitReception)
  @JoinColumn({ name: "fruit_reception_id" })
  fruitReception: FruitReception

  @Column({ type: "decimal", precision: 10, scale: 2 })
  boxes: number

  @Column({ name: "price_per_box", type: "decimal", precision: 10, scale: 2 })
  pricePerBox: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number
}
