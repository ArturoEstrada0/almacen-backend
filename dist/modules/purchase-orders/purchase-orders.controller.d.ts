import { PurchaseOrdersService } from "./purchase-orders.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    receive(id: string, itemId: string, quantity: number): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
    cancel(id: string): Promise<import("./entities/purchase-order.entity").PurchaseOrder>;
}
