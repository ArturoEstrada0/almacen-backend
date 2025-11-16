export declare enum PaymentMethod {
    CASH = "cash",
    TRANSFER = "transfer",
    CHECK = "check",
    OTHER = "other"
}
export declare enum AccountMovementType {
    CARGO = "cargo",
    ABONO = "abono",
    PAGO = "pago"
}
export declare class CreatePaymentDto {
    producerId: string;
    amount: number;
    method?: PaymentMethod;
    reference?: string;
    notes?: string;
    type?: AccountMovementType;
}
