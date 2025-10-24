import { Warehouse } from "../../warehouses/entities/warehouse.entity";
import { MovementItem } from "./movement-item.entity";
export declare class Movement {
    id: string;
    code: string;
    type: "entrada" | "salida" | "ajuste" | "traspaso";
    warehouseId: string;
    warehouse: Warehouse;
    destinationWarehouseId: string;
    destinationWarehouse: Warehouse;
    notes: string;
    referenceType: string;
    referenceId: string;
    createdBy: string;
    items: MovementItem[];
    createdAt: Date;
    updatedAt: Date;
}
