export declare enum PurchaseOrderStatus {
    PENDING = "pending",
    PARTIAL = "partial",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class CreatePurchaseOrderItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
}
export declare class CreatePurchaseOrderDto {
    supplierId: string;
    warehouseId: string;
    orderNumber?: string;
    expectedDate?: Date;
    notes?: string;
    items: CreatePurchaseOrderItemDto[];
}
