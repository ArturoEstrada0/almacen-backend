"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const purchase_order_entity_1 = require("../purchase-orders/entities/purchase-order.entity");
const supplier_entity_1 = require("../suppliers/entities/supplier.entity");
const shipment_entity_1 = require("../producers/entities/shipment.entity");
const fruit_reception_entity_1 = require("../producers/entities/fruit-reception.entity");
const input_assignment_entity_1 = require("../producers/entities/input-assignment.entity");
const input_assignment_item_entity_1 = require("../producers/entities/input-assignment-item.entity");
let DashboardService = class DashboardService {
    constructor(productsRepository, purchaseOrdersRepository, suppliersRepository, shipmentsRepository, fruitReceptionsRepository, inputAssignmentsRepository, inputAssignmentItemsRepository) {
        this.productsRepository = productsRepository;
        this.purchaseOrdersRepository = purchaseOrdersRepository;
        this.suppliersRepository = suppliersRepository;
        this.shipmentsRepository = shipmentsRepository;
        this.fruitReceptionsRepository = fruitReceptionsRepository;
        this.inputAssignmentsRepository = inputAssignmentsRepository;
        this.inputAssignmentItemsRepository = inputAssignmentItemsRepository;
    }
    async getKPIs() {
        try {
            const totalProducts = await this.productsRepository.count();
            const lowStockCount = 0;
            const pendingOrders = await this.purchaseOrdersRepository.count({
                where: { status: 'pendiente' }
            });
            const activeSuppliers = await this.suppliersRepository.count({
                where: { active: true }
            });
            const totalInventoryValue = 0;
            return {
                totalProducts,
                lowStockCount,
                pendingOrders,
                activeSuppliers,
                totalInventoryValue,
            };
        }
        catch (error) {
            console.error('Error getting KPIs:', error);
            return {
                totalProducts: 0,
                lowStockCount: 0,
                pendingOrders: 0,
                activeSuppliers: 0,
                totalInventoryValue: 0,
            };
        }
    }
    async getProfitReport() {
        try {
            const purchaseOrders = await this.purchaseOrdersRepository.find({
                where: { status: 'completada' },
                relations: ['items', 'items.product'],
            });
            const totalPurchaseCost = purchaseOrders.reduce((sum, order) => {
                return sum + Number(order.total || 0);
            }, 0);
            const inputAssignments = await this.inputAssignmentsRepository.find({
                relations: ['items', 'items.product', 'producer'],
            });
            const totalInputAssignmentsCost = inputAssignments.reduce((sum, assignment) => {
                return sum + Number(assignment.total || 0);
            }, 0);
            const inputAssignmentsByProduct = await this.inputAssignmentItemsRepository
                .createQueryBuilder('item')
                .leftJoinAndSelect('item.product', 'product')
                .leftJoinAndSelect('item.assignment', 'assignment')
                .select([
                'product.id as productId',
                'product.name as productName',
                'SUM(item.quantity) as totalQuantity',
                'SUM(item.total) as totalCost',
            ])
                .groupBy('product.id')
                .addGroupBy('product.name')
                .getRawMany();
            const shipments = await this.shipmentsRepository.find({
                where: { status: 'vendida' },
                relations: ['receptions', 'receptions.product', 'receptions.producer'],
            });
            const totalSalesRevenue = shipments.reduce((sum, shipment) => {
                return sum + Number(shipment.totalSale || 0);
            }, 0);
            const totalBoxesShipped = shipments.reduce((sum, shipment) => {
                return sum + Number(shipment.totalBoxes || 0);
            }, 0);
            const shipmentsSummary = shipments.map(shipment => ({
                code: shipment.code,
                date: shipment.date,
                boxes: Number(shipment.totalBoxes || 0),
                pricePerBox: shipment.salePricePerBox ? Number(shipment.salePricePerBox) : 0,
                totalSale: shipment.totalSale ? Number(shipment.totalSale) : 0,
                status: shipment.status,
            }));
            const fruitReceptions = await this.fruitReceptionsRepository.find({
                relations: ['product', 'producer'],
            });
            const totalBoxesReceived = fruitReceptions.reduce((sum, reception) => {
                return sum + Number(reception.boxes || 0);
            }, 0);
            const totalCosts = totalInputAssignmentsCost;
            const totalRevenue = totalSalesRevenue;
            const grossProfit = totalRevenue - totalCosts;
            const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
            const averagePricePerBox = totalBoxesShipped > 0 ? totalRevenue / totalBoxesShipped : 0;
            const costPerBox = totalBoxesReceived > 0 ? totalCosts / totalBoxesReceived : 0;
            const profitPerBox = averagePricePerBox - costPerBox;
            return {
                summary: {
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    totalCosts: Number(totalCosts.toFixed(2)),
                    grossProfit: Number(grossProfit.toFixed(2)),
                    profitMargin: Number(profitMargin.toFixed(2)),
                },
                costs: {
                    totalPurchaseOrders: Number(totalPurchaseCost.toFixed(2)),
                    totalInputAssignments: Number(totalInputAssignmentsCost.toFixed(2)),
                    inputAssignmentsByProduct: inputAssignmentsByProduct.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        totalQuantity: Number(item.totalQuantity),
                        totalCost: Number(Number(item.totalCost).toFixed(2)),
                    })),
                },
                revenue: {
                    totalSales: Number(totalSalesRevenue.toFixed(2)),
                    totalBoxesShipped: Number(totalBoxesShipped),
                    averagePricePerBox: Number(averagePricePerBox.toFixed(2)),
                    shipments: shipmentsSummary,
                },
                operations: {
                    totalBoxesReceived: Number(totalBoxesReceived),
                    totalBoxesShipped: Number(totalBoxesShipped),
                    boxesInProcess: Number(totalBoxesReceived - totalBoxesShipped),
                    costPerBox: Number(costPerBox.toFixed(2)),
                    profitPerBox: Number(profitPerBox.toFixed(2)),
                },
                counts: {
                    purchaseOrders: purchaseOrders.length,
                    inputAssignments: inputAssignments.length,
                    fruitReceptions: fruitReceptions.length,
                    shipmentsSold: shipments.length,
                },
                generatedAt: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('Error generating profit report:', error);
            throw error;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __param(2, (0, typeorm_1.InjectRepository)(supplier_entity_1.Supplier)),
    __param(3, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(4, (0, typeorm_1.InjectRepository)(fruit_reception_entity_1.FruitReception)),
    __param(5, (0, typeorm_1.InjectRepository)(input_assignment_entity_1.InputAssignment)),
    __param(6, (0, typeorm_1.InjectRepository)(input_assignment_item_entity_1.InputAssignmentItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map