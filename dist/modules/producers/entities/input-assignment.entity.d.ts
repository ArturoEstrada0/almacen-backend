import { Producer } from "./producer.entity";
import { InputAssignmentItem } from "./input-assignment-item.entity";
export declare class InputAssignment {
    id: string;
    code: string;
    producerId: string;
    producer: Producer;
    date: Date;
    total: number;
    notes: string;
    items: InputAssignmentItem[];
    createdAt: Date;
    updatedAt: Date;
}
