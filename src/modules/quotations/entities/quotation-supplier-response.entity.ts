import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuotationItem } from './quotation-item.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('quotation_supplier_responses')
export class QuotationSupplierResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quotation_item_id' })
  quotationItemId: string;

  @ManyToOne(() => QuotationItem, (item) => item.supplierResponses)
  @JoinColumn({ name: 'quotation_item_id' })
  quotationItem: QuotationItem;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ['MXN', 'USD'],
    default: 'MXN',
  })
  currency: 'MXN' | 'USD';

  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  available: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
