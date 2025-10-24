import { Category } from "../../categories/entities/category.entity";
import { Unit } from "../../units/entities/unit.entity";
import { ProductSupplier } from "./product-supplier.entity";
import { InventoryItem } from "../../inventory/entities/inventory-item.entity";
export declare class Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    type: "insumo" | "fruta";
    cost: number;
    price: number;
    image: string;
    barcode: string;
    active: boolean;
    categoryId: string;
    category: Category;
    unitId: string;
    unit: Unit;
    productSuppliers: ProductSupplier[];
    inventoryItems: InventoryItem[];
    createdAt: Date;
    updatedAt: Date;
}
