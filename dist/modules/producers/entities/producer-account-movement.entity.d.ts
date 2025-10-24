import { Producer } from "./producer.entity";
export declare class ProducerAccountMovement {
    id: string;
    producerId: string;
    producer: Producer;
    type: "cargo" | "abono" | "pago";
    amount: number;
    balance: number;
    referenceType: string;
    referenceId: string;
    referenceCode: string;
    description: string;
    paymentMethod: string;
    paymentReference: string;
    evidenceUrl: string;
    createdAt: Date;
}
