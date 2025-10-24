import { InputAssignment } from "./input-assignment.entity";
import { Product } from "../../products/entities/product.entity";
export declare class InputAssignmentItem {
    id: string;
    assignmentId: string;
    assignment: InputAssignment;
    productId: string;
    product: Product;
    quantity: number;
    price: number;
    total: number;
}
