import { Location } from "./location.entity";
import { InventoryItem } from "../../inventory/entities/inventory-item.entity";
export declare class Warehouse {
    id: string;
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    manager: string;
    active: boolean;
    locations: Location[];
    inventoryItems: InventoryItem[];
    createdAt: Date;
    updatedAt: Date;
}
