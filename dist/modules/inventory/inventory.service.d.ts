import type { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { InventoryItem } from "./entities/inventory-item.entity";
import { Movement } from "./entities/movement.entity";
import { MovementItem } from "./entities/movement-item.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { type CreateMovementDto } from "./dto/create-movement.dto";
export declare class InventoryService {
    private inventoryRepository;
    private warehouseRepository;
    private movementsRepository;
    private movementItemsRepository;
    private dataSource;
    constructor(inventoryRepository: Repository<InventoryItem>, warehouseRepository: Repository<Warehouse>, movementsRepository: Repository<Movement>, movementItemsRepository: Repository<MovementItem>, dataSource: DataSource);
    getInventory(warehouseId?: string): Promise<InventoryItem[]>;
    getInventoryByProduct(productId: string): Promise<InventoryItem[]>;
    createMovement(createMovementDto: CreateMovementDto): Promise<Movement>;
    private updateInventory;
    getMovements(warehouseId?: string): Promise<Movement[]>;
    getMovement(id: string): Promise<Movement>;
    updateInventorySettings(productId: string, body: {
        warehouseId: string;
        minStock?: number;
        maxStock?: number;
        reorderPoint?: number;
        locationId?: string;
    }): Promise<InventoryItem>;
}
