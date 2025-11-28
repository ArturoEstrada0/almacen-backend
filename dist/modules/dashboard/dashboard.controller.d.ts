import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
