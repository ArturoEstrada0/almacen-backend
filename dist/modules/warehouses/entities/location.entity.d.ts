import { Warehouse } from "./warehouse.entity";
export declare class Location {
    id: string;
    warehouseId: string;
    warehouse: Warehouse;
    zone: string;
    aisle: string;
    rack: string;
    level: string;
    code: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
