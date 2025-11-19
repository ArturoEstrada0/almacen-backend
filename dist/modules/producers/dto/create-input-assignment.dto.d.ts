export declare class InputAssignmentItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateInputAssignmentDto {
    producerId: string;
    warehouseId: string;
    date?: string;
    trackingFolio?: string;
    notes?: string;
    items: InputAssignmentItemDto[];
}
