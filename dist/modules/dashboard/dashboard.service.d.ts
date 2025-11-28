import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Shipment } from '../producers/entities/shipment.entity';
import { FruitReception } from '../producers/entities/fruit-reception.entity';
import { InputAssignment } from '../producers/entities/input-assignment.entity';
import { InputAssignmentItem } from '../producers/entities/input-assignment-item.entity';
export declare class DashboardService {
    private productsRepository;
    private purchaseOrdersRepository;
    private suppliersRepository;
    private shipmentsRepository;
    private fruitReceptionsRepository;
    private inputAssignmentsRepository;
    private inputAssignmentItemsRepository;
    constructor(productsRepository: Repository<Product>, purchaseOrdersRepository: Repository<PurchaseOrder>, suppliersRepository: Repository<Supplier>, shipmentsRepository: Repository<Shipment>, fruitReceptionsRepository: Repository<FruitReception>, inputAssignmentsRepository: Repository<InputAssignment>, inputAssignmentItemsRepository: Repository<InputAssignmentItem>);
    getKPIs(): Promise<{
        totalProducts: number;
        lowStockCount: number;
        pendingOrders: number;
        activeSuppliers: number;
        totalInventoryValue: number;
    }>;
    getProfitReport(): Promise<{
        summary: {
            totalRevenue: number;
            totalCosts: number;
            grossProfit: number;
            profitMargin: number;
        };
        costs: {
            totalPurchaseOrders: number;
            totalInputAssignments: number;
            inputAssignmentsByProduct: {
                productId: any;
                productName: any;
                totalQuantity: number;
                totalCost: number;
            }[];
        };
        revenue: {
            totalSales: number;
            totalBoxesShipped: number;
            averagePricePerBox: number;
            shipments: {
                code: string;
                date: string;
                boxes: number;
                pricePerBox: number;
                totalSale: number;
                status: "embarcada" | "en-transito" | "recibida" | "vendida";
            }[];
        };
        operations: {
            totalBoxesReceived: number;
            totalBoxesShipped: number;
            boxesInProcess: number;
            costPerBox: number;
            profitPerBox: number;
        };
        counts: {
            purchaseOrders: number;
            inputAssignments: number;
            fruitReceptions: number;
            shipmentsSold: number;
        };
        generatedAt: string;
    }>;
}
