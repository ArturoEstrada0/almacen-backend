import { Producer } from "./producer.entity";
import { Product } from "../../products/entities/product.entity";
import { Shipment } from "./shipment.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
export declare class FruitReception {
    id: string;
    code: string;
    producerId: string;
    producer: Producer;
    productId: string;
    product: Product;
    warehouseId: string;
    warehouse: Warehouse;
    date: Date;
    boxes: number;
    weightPerBox: number;
    totalWeight: number;
    shipmentStatus: "pendiente" | "embarcada" | "vendida";
    shipmentId: string;
    shipment: Shipment;
    pricePerBox: number;
    finalTotal: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
