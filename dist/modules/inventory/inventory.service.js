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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_item_entity_1 = require("./entities/inventory-item.entity");
const movement_entity_1 = require("./entities/movement.entity");
const movement_item_entity_1 = require("./entities/movement-item.entity");
const warehouse_entity_1 = require("../warehouses/entities/warehouse.entity");
const create_movement_dto_1 = require("./dto/create-movement.dto");
let InventoryService = class InventoryService {
    constructor(inventoryRepository, warehouseRepository, movementsRepository, movementItemsRepository, dataSource) {
        this.inventoryRepository = inventoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.movementsRepository = movementsRepository;
        this.movementItemsRepository = movementItemsRepository;
        this.dataSource = dataSource;
    }
    async getInventory(warehouseId) {
        const where = warehouseId ? { warehouseId } : {};
        return await this.inventoryRepository.find({
            where,
            relations: ["product", "warehouse"],
            order: { product: { name: "ASC" } },
        });
    }
    async getInventoryByProduct(productId) {
        return await this.inventoryRepository.find({
            where: { productId },
            relations: ["warehouse"],
        });
    }
    async createMovement(createMovementDto) {
        if (createMovementDto.type === create_movement_dto_1.MovementType.TRASPASO) {
            if (!createMovementDto.destinationWarehouseId) {
                throw new common_1.BadRequestException("destinationWarehouseId is required for traspaso");
            }
            if (createMovementDto.destinationWarehouseId === createMovementDto.warehouseId) {
                throw new common_1.BadRequestException("Source and destination warehouse must be different for traspaso");
            }
            const [src, dest] = await Promise.all([
                this.warehouseRepository.findOne({ where: { id: createMovementDto.warehouseId } }),
                this.warehouseRepository.findOne({ where: { id: createMovementDto.destinationWarehouseId } }),
            ]);
            if (!src)
                throw new common_1.BadRequestException(`Source warehouse ${createMovementDto.warehouseId} not found`);
            if (!dest)
                throw new common_1.BadRequestException(`Destination warehouse ${createMovementDto.destinationWarehouseId} not found`);
            if (!src.active)
                throw new common_1.BadRequestException(`Source warehouse ${createMovementDto.warehouseId} is not active`);
            if (!dest.active)
                throw new common_1.BadRequestException(`Destination warehouse ${createMovementDto.destinationWarehouseId} is not active`);
            for (const itemDto of createMovementDto.items) {
                const whereClause = { warehouseId: createMovementDto.warehouseId, productId: itemDto.productId };
                if (itemDto.locationId)
                    whereClause.locationCode = itemDto.locationId;
                const inv = await this.inventoryRepository.findOne({ where: whereClause });
                const available = inv ? Number(inv.quantity) : 0;
                if (available < Number(itemDto.quantity)) {
                    throw new common_1.BadRequestException(`Insufficient stock in source warehouse for product ${itemDto.productId}`);
                }
            }
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const createdMovement = this.movementsRepository.create({
                code: `MV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: createMovementDto.type,
                warehouseId: createMovementDto.warehouseId,
                destinationWarehouseId: createMovementDto.destinationWarehouseId,
                referenceType: createMovementDto.referenceType || undefined,
                referenceId: createMovementDto.referenceId || undefined,
                notes: createMovementDto.notes,
            });
            await queryRunner.manager.save(createdMovement);
            for (const itemDto of createMovementDto.items) {
                const movementItem = this.movementItemsRepository.create({
                    movementId: createdMovement.id,
                    productId: itemDto.productId,
                    quantity: itemDto.quantity,
                    locationId: itemDto.locationId,
                    notes: itemDto.notes,
                });
                await queryRunner.manager.save(movementItem);
                await this.updateInventory(queryRunner, createMovementDto.type, createMovementDto.warehouseId, itemDto.productId, itemDto.quantity, itemDto.locationId, createMovementDto.destinationWarehouseId);
            }
            await queryRunner.commitTransaction();
            return await this.movementsRepository.findOne({
                where: { id: createdMovement.id },
                relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
            });
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateInventory(queryRunner, type, warehouseId, productId, quantity, locationId, destinationWarehouseId) {
        const whereClause = { warehouseId, productId };
        if (locationId) {
            whereClause.locationCode = locationId;
        }
        let inventoryItem = await queryRunner.manager.findOne(inventory_item_entity_1.InventoryItem, {
            where: whereClause,
        });
        if (!inventoryItem) {
            inventoryItem = queryRunner.manager.create(inventory_item_entity_1.InventoryItem, {
                warehouseId,
                productId,
                locationCode: locationId || null,
                quantity: 0,
                minStock: 0,
                maxStock: 1000,
            });
        }
        const toNumber = (v) => {
            const n = Number(v);
            return Number.isNaN(n) ? 0 : n;
        };
        switch (type) {
            case create_movement_dto_1.MovementType.ENTRADA:
                inventoryItem.quantity = toNumber(inventoryItem.quantity) + Number(quantity);
                break;
            case create_movement_dto_1.MovementType.SALIDA:
                if (toNumber(inventoryItem.quantity) < Number(quantity)) {
                    throw new common_1.BadRequestException("Insufficient stock");
                }
                inventoryItem.quantity = toNumber(inventoryItem.quantity) - Number(quantity);
                break;
            case create_movement_dto_1.MovementType.AJUSTE:
                inventoryItem.quantity = Number(quantity);
                break;
            case create_movement_dto_1.MovementType.TRASPASO:
                if (toNumber(inventoryItem.quantity) < Number(quantity)) {
                    throw new common_1.BadRequestException("Insufficient stock for transfer");
                }
                inventoryItem.quantity = toNumber(inventoryItem.quantity) - Number(quantity);
                if (destinationWarehouseId) {
                    let destInventory = await queryRunner.manager.findOne(inventory_item_entity_1.InventoryItem, {
                        where: { warehouseId: destinationWarehouseId, productId },
                    });
                    if (!destInventory) {
                        destInventory = queryRunner.manager.create(inventory_item_entity_1.InventoryItem, {
                            warehouseId: destinationWarehouseId,
                            productId,
                            quantity: 0,
                            minStock: 0,
                            maxStock: 1000,
                        });
                    }
                    destInventory.quantity = toNumber(destInventory.quantity) + Number(quantity);
                    await queryRunner.manager.save(destInventory);
                }
                break;
        }
        await queryRunner.manager.save(inventoryItem);
    }
    async getMovements(warehouseId) {
        const where = warehouseId ? { warehouseId } : {};
        return await this.movementsRepository.find({
            where,
            relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
            order: { createdAt: "DESC" },
        });
    }
    async getMovement(id) {
        const movement = await this.movementsRepository.findOne({
            where: { id },
            relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
        });
        if (!movement) {
            throw new common_1.NotFoundException(`Movement with ID ${id} not found`);
        }
        return movement;
    }
    async updateInventorySettings(productId, body) {
        const { warehouseId, minStock, maxStock, reorderPoint, locationId } = body;
        const where = { productId };
        if (warehouseId)
            where.warehouseId = warehouseId;
        let inventoryItem = await this.inventoryRepository.findOne({ where });
        if (!inventoryItem) {
            inventoryItem = this.inventoryRepository.create({
                productId,
                warehouseId,
                locationCode: locationId || null,
                quantity: 0,
                minStock: minStock ?? 0,
                maxStock: maxStock ?? 0,
                reorderPoint: reorderPoint ?? 0,
            });
        }
        else {
            if (minStock !== undefined)
                inventoryItem.minStock = minStock;
            if (maxStock !== undefined)
                inventoryItem.maxStock = maxStock;
            if (reorderPoint !== undefined)
                inventoryItem.reorderPoint = reorderPoint;
            if (locationId !== undefined)
                inventoryItem.locationCode = locationId;
        }
        return await this.inventoryRepository.save(inventoryItem);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __param(1, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __param(2, (0, typeorm_1.InjectRepository)(movement_entity_1.Movement)),
    __param(3, (0, typeorm_1.InjectRepository)(movement_item_entity_1.MovementItem)),
    __metadata("design:paramtypes", [Function, Function, Function, Function, typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map