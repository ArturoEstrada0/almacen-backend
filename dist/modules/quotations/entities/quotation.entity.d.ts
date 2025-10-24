import { Supplier } from "../../suppliers/entities/supplier.entity";
import { QuotationItem } from "./quotation-item.entity";
export declare class Quotation {
    id: string;
    code: string;
    supplierId: string;
    supplier: Supplier;
    status: "pendiente" | "enviada" | "respondida" | "ganadora" | "rechazada";
    date: Date;
    validUntil: Date;
    total: number;
    notes: string;
    emailSent: boolean;
    emailSentAt: Date;
    purchaseOrderId: string;
    items: QuotationItem[];
    createdAt: Date;
    updatedAt: Date;
}
