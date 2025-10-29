import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { InputAssignment } from "./input-assignment.entity"
import { Product } from "../../products/entities/product.entity"

@Entity("input_assignment_items")
export class InputAssignmentItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "assignment_id" })
  assignmentId: string

  @ManyToOne(
    () => InputAssignment,
    (assignment) => assignment.items,
  )
  @JoinColumn({ name: "assignment_id" })
  assignment: InputAssignment

  @Column({ name: "product_id" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product

  @Column({ type: "decimal", precision: 10, scale: 2 })
  quantity: number

  @Column({ name: "unit_price", type: "decimal", precision: 10, scale: 2 })
  price: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number
}
