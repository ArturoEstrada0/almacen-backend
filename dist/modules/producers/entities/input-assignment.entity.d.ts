import { Producer } from "./producer.entity";
import { InputAssignmentItem } from "./input-assignment-item.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
export declare class InputAssignment {
    id: string;
    code: string;
    producerId: string;
    producer: Producer;
    date: Date;
    warehouseId: string;
    warehouse: Warehouse;
    total: number;
    notes: string;
    items: InputAssignmentItem[];
    createdAt: Date;
    updatedAt: Date;
}
