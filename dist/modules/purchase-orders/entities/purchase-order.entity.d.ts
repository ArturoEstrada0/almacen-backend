import { Supplier } from "../../suppliers/entities/supplier.entity";
import { PurchaseOrderItem } from "./purchase-order-item.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
export declare class PurchaseOrder {
    id: string;
    code: string;
    supplierId: string;
    supplier: Supplier;
    status: "pendiente" | "parcial" | "completada" | "cancelada";
    date: Date;
    expectedDate: Date;
    subtotal: number;
    tax: number;
    total: number;
    paymentTerms: number;
    dueDate: Date;
    amountPaid: number;
    notes: string;
    quotationId: string;
    items: PurchaseOrderItem[];
    warehouseId: string;
    warehouse: Warehouse;
    createdAt: Date;
    updatedAt: Date;
}
