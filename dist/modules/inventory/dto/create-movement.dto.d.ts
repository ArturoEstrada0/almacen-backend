export declare enum MovementType {
    ENTRADA = "entrada",
    SALIDA = "salida",
    AJUSTE = "ajuste",
    TRASPASO = "traspaso"
}
export declare class CreateMovementItemDto {
    productId: string;
    quantity: number;
    locationId?: string;
    notes?: string;
}
export declare class CreateMovementDto {
    type: MovementType;
    warehouseId: string;
    destinationWarehouseId?: string;
    reference?: string;
    notes?: string;
    items: CreateMovementItemDto[];
}
