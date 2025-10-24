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
var PurchaseOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_order_entity_1 = require("./entities/purchase-order.entity");
const purchase_order_item_entity_1 = require("./entities/purchase-order-item.entity");
const inventory_service_1 = require("../inventory/inventory.service");
const create_movement_dto_1 = require("../inventory/dto/create-movement.dto");
let PurchaseOrdersService = PurchaseOrdersService_1 = class PurchaseOrdersService {
    constructor(purchaseOrdersRepository, purchaseOrderItemsRepository, inventoryService, dataSource) {
        this.purchaseOrdersRepository = purchaseOrdersRepository;
        this.purchaseOrderItemsRepository = purchaseOrderItemsRepository;
        this.inventoryService = inventoryService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PurchaseOrdersService_1.name);
    }
    async create(createPurchaseOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const total = createPurchaseOrderDto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            const generatedCode = createPurchaseOrderDto.orderNumber || `OC-${Date.now()}`;
            const orderDate = new Date();
            const { items: dtoItems, ...purchaseOrderFields } = createPurchaseOrderDto;
            const purchaseOrder = this.purchaseOrdersRepository.create({
                ...purchaseOrderFields,
                code: generatedCode,
                date: orderDate,
                status: "pendiente",
                total,
            });
            await queryRunner.manager.save(purchaseOrder);
            this.logger.log(`Creating purchase order with payload: ${JSON.stringify({
                supplierId: createPurchaseOrderDto.supplierId,
                warehouseId: createPurchaseOrderDto.warehouseId,
                items: createPurchaseOrderDto.items,
            })}`);
            for (const itemDto of (dtoItems || [])) {
                const rawPrice = itemDto.unitPrice ?? itemDto.price ?? itemDto.unit_price;
                const price = Number(rawPrice);
                if (!Number.isFinite(price)) {
                    this.logger.error(`Invalid item payload when creating purchase order (price missing or not numeric): ${JSON.stringify(itemDto)}`);
                    throw new common_1.BadRequestException(`Missing or invalid price for product ${itemDto?.productId}`);
                }
                const qty = Number(itemDto.quantity);
                if (!Number.isFinite(qty) || qty <= 0) {
                    this.logger.error(`Invalid item payload when creating purchase order (quantity missing or invalid): ${JSON.stringify(itemDto)}`);
                    throw new common_1.BadRequestException(`Missing or invalid quantity for product ${itemDto?.productId}`);
                }
                const plainItem = {
                    purchaseOrderId: purchaseOrder.id,
                    productId: itemDto.productId,
                    quantity: qty,
                    receivedQuantity: 0,
                    price: price.toFixed(2),
                    total: (qty * price).toFixed(2),
                    notes: itemDto.notes,
                };
                try {
                    this.logger.log(`Saving purchase order item (plain): ${JSON.stringify(plainItem)}`);
                }
                catch (e) {
                    this.logger.log(`Saving purchase order item (plain): ${String(plainItem)}`);
                }
                try {
                    await queryRunner.query(`INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, received_quantity, price, total, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [plainItem.purchaseOrderId, plainItem.productId, plainItem.quantity, plainItem.receivedQuantity, plainItem.price, plainItem.total, plainItem.notes]);
                }
                catch (err) {
                    this.logger.error(`Failed raw insert for purchase order item: ${JSON.stringify(plainItem)} - ${err}`);
                    throw err;
                }
            }
            await queryRunner.commitTransaction();
            return await this.findOne(purchaseOrder.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async loadEntity(id) {
        const purchaseOrder = await this.purchaseOrdersRepository.findOne({
            where: { id },
            relations: ["supplier", "warehouse", "items", "items.product"],
        });
        if (!purchaseOrder) {
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        }
        return purchaseOrder;
    }
    mapPurchaseOrder(purchaseOrder) {
        const po = { ...purchaseOrder };
        po.orderNumber = purchaseOrder.code;
        po.orderDate = purchaseOrder.date;
        po.expectedDeliveryDate = purchaseOrder.expectedDate ?? null;
        po.items = (purchaseOrder.items || []).map((it) => ({
            ...it,
            unitPrice: it.price !== undefined && it.price !== null ? Number(it.price) : undefined,
            total: it.total !== undefined && it.total !== null ? Number(it.total) : undefined,
        }));
        return po;
    }
    async findAll() {
        const list = await this.purchaseOrdersRepository.find({
            relations: ["supplier", "warehouse", "items", "items.product"],
            order: { createdAt: "DESC" },
        });
        return list.map((p) => this.mapPurchaseOrder(p));
    }
    async findOne(id) {
        const purchaseOrder = await this.loadEntity(id);
        return this.mapPurchaseOrder(purchaseOrder);
    }
    async receive(id, itemId, quantity) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const purchaseOrder = await this.loadEntity(id);
            const item = purchaseOrder.items.find((i) => i.id === itemId);
            if (!item) {
                throw new common_1.NotFoundException(`Item with ID ${itemId} not found in purchase order`);
            }
            const currentReceived = Number(item.receivedQuantity) || 0;
            const addQty = Number(quantity) || 0;
            item.receivedQuantity = currentReceived + addQty;
            await queryRunner.manager.save(item);
            await this.inventoryService.createMovement({
                type: create_movement_dto_1.MovementType.ENTRADA,
                warehouseId: purchaseOrder.warehouseId,
                reference: `PO-${purchaseOrder.code}`,
                notes: `Recepción de orden de compra ${purchaseOrder.code}`,
                items: [
                    {
                        productId: item.productId,
                        quantity,
                    },
                ],
            });
            const allItemsReceived = purchaseOrder.items.every((i) => Number(i.receivedQuantity) >= Number(i.quantity));
            const someItemsReceived = purchaseOrder.items.some((i) => Number(i.receivedQuantity) > 0);
            if (allItemsReceived) {
                purchaseOrder.status = "completada";
            }
            else if (someItemsReceived) {
                purchaseOrder.status = "parcial";
            }
            await queryRunner.manager.save(purchaseOrder);
            await queryRunner.commitTransaction();
            return await this.findOne(id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancel(id) {
        const purchaseOrder = await this.loadEntity(id);
        purchaseOrder.status = "cancelada";
        await this.purchaseOrdersRepository.save(purchaseOrder);
        return this.mapPurchaseOrder(purchaseOrder);
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = PurchaseOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_order_item_entity_1.PurchaseOrderItem)),
    __metadata("design:paramtypes", [Function, Function, inventory_service_1.InventoryService,
        typeorm_2.DataSource])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map