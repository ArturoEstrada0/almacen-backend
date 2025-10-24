import type { Repository } from "typeorm";
import { DataSource } from "typeorm";
import { PurchaseOrder } from "./entities/purchase-order.entity";
import { PurchaseOrderItem } from "./entities/purchase-order-item.entity";
import { type CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { InventoryService } from "../inventory/inventory.service";
export declare class PurchaseOrdersService {
    private purchaseOrdersRepository;
    private purchaseOrderItemsRepository;
    private inventoryService;
    private dataSource;
    private readonly logger;
    constructor(purchaseOrdersRepository: Repository<PurchaseOrder>, purchaseOrderItemsRepository: Repository<PurchaseOrderItem>, inventoryService: InventoryService, dataSource: DataSource);
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder>;
    private loadEntity;
    private mapPurchaseOrder;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    receive(id: string, itemId: string, quantity: number): Promise<PurchaseOrder>;
    cancel(id: string): Promise<PurchaseOrder>;
}
