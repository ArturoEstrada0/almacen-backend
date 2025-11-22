export declare class ReturnedItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateFruitReceptionDto {
    producerId: string;
    productId: string;
    warehouseId: string;
    boxes: number;
    trackingFolio?: string;
    date?: string;
    weightPerBox?: number;
    totalWeight?: number;
    quality?: string;
    notes?: string;
    returnedBoxes?: number;
    returnedBoxesValue?: number;
    returnedItems?: ReturnedItemDto[];
}
