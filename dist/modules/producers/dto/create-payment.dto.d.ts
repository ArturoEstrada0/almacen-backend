export declare enum PaymentMethod {
    CASH = "cash",
    TRANSFER = "transfer",
    CHECK = "check",
    OTHER = "other"
}
export declare class RetentionDto {
    amount: number;
    notes?: string;
}
export declare class CreatePaymentDto {
    producerId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    selectedMovements?: string[];
    retention?: RetentionDto;
}
