import { Product } from "../../products/entities/product.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";
export declare class InventoryItem {
    id: string;
    productId: string;
    product: Product;
    warehouseId: string;
    warehouse: Warehouse;
    quantity: number;
    minStock: number;
    maxStock: number;
    reorderPoint: number;
    locationCode: string;
    createdAt: Date;
    updatedAt: Date;
}
