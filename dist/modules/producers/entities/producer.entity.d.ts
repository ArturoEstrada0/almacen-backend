import { InputAssignment } from "./input-assignment.entity";
import { FruitReception } from "./fruit-reception.entity";
import { ProducerAccountMovement } from "./producer-account-movement.entity";
export declare class Producer {
    id: string;
    name: string;
    code: string;
    rfc: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    accountBalance: number;
    active: boolean;
    inputAssignments: InputAssignment[];
    fruitReceptions: FruitReception[];
    accountMovements: ProducerAccountMovement[];
    createdAt: Date;
    updatedAt: Date;
}
