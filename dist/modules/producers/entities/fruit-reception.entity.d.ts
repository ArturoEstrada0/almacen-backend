import { Producer } from "./producer.entity";
import { Product } from "../../products/entities/product.entity";
export declare class FruitReception {
    id: string;
    code: string;
    producerId: string;
    producer: Producer;
    productId: string;
    product: Product;
    date: Date;
    boxes: number;
    weightPerBox: number;
    totalWeight: number;
    shipmentStatus: "pendiente" | "embarcada" | "vendida";
    shipmentId: string;
    pricePerBox: number;
    finalTotal: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
