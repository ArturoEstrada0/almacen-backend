export declare class PaymentReportItemDto {
    fruitReceptionId: string;
    boxes: number;
    pricePerBox: number;
}
export declare class CreatePaymentReportDto {
    producerId: string;
    date?: string;
    items: PaymentReportItemDto[];
    retentionAmount?: number;
    retentionNotes?: string;
    notes?: string;
}
export declare enum PaymentReportStatus {
    PENDIENTE = "pendiente",
    PAGADO = "pagado",
    CANCELADO = "cancelado"
}
export declare class UpdatePaymentReportStatusDto {
    status: PaymentReportStatus;
    paymentMethod?: string;
    paymentReference?: string;
    notes?: string;
    invoiceUrl?: string;
    receiptUrl?: string;
    paymentComplementUrl?: string;
    isrAmount?: number;
}
