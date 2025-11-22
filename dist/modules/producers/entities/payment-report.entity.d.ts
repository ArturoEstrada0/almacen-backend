import { Producer } from "./producer.entity";
import { PaymentReportItem } from "./payment-report-item.entity";
export declare class PaymentReport {
    id: string;
    code: string;
    producerId: string;
    producer: Producer;
    date: string;
    subtotal: number;
    retentionAmount: number;
    retentionNotes: string;
    totalToPay: number;
    status: "pendiente" | "pagado" | "cancelado";
    paymentMethod: string;
    paymentReference: string;
    paidAt: Date;
    invoiceUrl: string;
    receiptUrl: string;
    paymentComplementUrl: string;
    isrAmount: number;
    notes: string;
    items: PaymentReportItem[];
    createdAt: Date;
    updatedAt: Date;
}
