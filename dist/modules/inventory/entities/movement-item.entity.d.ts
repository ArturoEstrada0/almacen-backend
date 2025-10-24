import { Movement } from "./movement.entity";
import { Product } from "../../products/entities/product.entity";
export declare class MovementItem {
    id: string;
    movementId: string;
    movement: Movement;
    productId: string;
    product: Product;
    quantity: number;
    cost: number;
    notes: string;
}
