import { FruitReception } from "./fruit-reception.entity";
import { Product } from "../../products/entities/product.entity";
export declare class ReturnedItem {
    id: string;
    receptionId: string;
    reception: FruitReception;
    productId: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    total: number;
}
