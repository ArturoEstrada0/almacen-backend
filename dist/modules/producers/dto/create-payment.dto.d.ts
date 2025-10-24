export declare enum PaymentMethod {
    CASH = "cash",
    TRANSFER = "transfer",
    CHECK = "check",
    OTHER = "other"
}
export declare class CreatePaymentDto {
    producerId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
}
