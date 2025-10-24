import { InventoryService } from "./inventory.service";
import { CreateMovementDto } from "./dto/create-movement.dto";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getInventory(warehouseId?: string): Promise<import("./entities/inventory-item.entity").InventoryItem[]>;
    getInventoryByProduct(productId: string): Promise<import("./entities/inventory-item.entity").InventoryItem[]>;
    getInventoryByWarehouse(id: string): Promise<import("./entities/inventory-item.entity").InventoryItem[]>;
    createMovement(createMovementDto: CreateMovementDto): Promise<import("./entities/movement.entity").Movement>;
    updateInventory(productId: string, body: {
        warehouseId: string;
        minStock?: number;
        maxStock?: number;
        reorderPoint?: number;
        locationId?: string;
    }): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    updateInventoryCompat(productId: string, body: {
        warehouseId: string;
        minStock?: number;
        maxStock?: number;
        reorderPoint?: number;
        locationId?: string;
    }): Promise<import("./entities/inventory-item.entity").InventoryItem>;
    getMovements(warehouseId?: string): Promise<import("./entities/movement.entity").Movement[]>;
    getMovement(id: string): Promise<import("./entities/movement.entity").Movement>;
}
