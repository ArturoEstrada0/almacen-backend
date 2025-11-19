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
exports.ProducersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const producer_entity_1 = require("./entities/producer.entity");
const input_assignment_entity_1 = require("./entities/input-assignment.entity");
const input_assignment_item_entity_1 = require("./entities/input-assignment-item.entity");
const fruit_reception_entity_1 = require("./entities/fruit-reception.entity");
const shipment_entity_1 = require("./entities/shipment.entity");
const producer_account_movement_entity_1 = require("./entities/producer-account-movement.entity");
const inventory_service_1 = require("../inventory/inventory.service");
const create_movement_dto_1 = require("../inventory/dto/create-movement.dto");
const product_entity_1 = require("../products/entities/product.entity");
let ProducersService = class ProducersService {
    constructor(producersRepository, inputAssignmentsRepository, inputAssignmentItemsRepository, fruitReceptionsRepository, shipmentsRepository, accountMovementsRepository, inventoryService, dataSource) {
        this.producersRepository = producersRepository;
        this.inputAssignmentsRepository = inputAssignmentsRepository;
        this.inputAssignmentItemsRepository = inputAssignmentItemsRepository;
        this.fruitReceptionsRepository = fruitReceptionsRepository;
        this.shipmentsRepository = shipmentsRepository;
        this.accountMovementsRepository = accountMovementsRepository;
        this.inventoryService = inventoryService;
        this.dataSource = dataSource;
    }
    generateCode(prefix) {
        return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000) + 1000}`;
    }
    generateTrackingFolio() {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 900 + 100);
        return `${year}${month}${day}-${random}`;
    }
    async create(createProducerDto) {
        const payload = { ...createProducerDto };
        if (createProducerDto.taxId) {
            payload.rfc = createProducerDto.taxId;
        }
        const producer = this.producersRepository.create(payload);
        const saved = await this.producersRepository.save(producer);
        return saved;
    }
    async findAll() {
        return await this.producersRepository.find({
            order: { name: "ASC" },
        });
    }
    async findOne(id) {
        const producer = await this.producersRepository.findOne({
            where: { id },
            relations: ["inputAssignments", "fruitReceptions", "accountMovements"],
        });
        if (!producer) {
            throw new common_1.NotFoundException(`Producer with ID ${id} not found`);
        }
        return producer;
    }
    async updateProducer(id, updateProducerDto) {
        const producer = await this.producersRepository.findOne({ where: { id } });
        if (!producer) {
            throw new common_1.NotFoundException(`Producer with ID ${id} not found`);
        }
        Object.assign(producer, updateProducerDto);
        return await this.producersRepository.save(producer);
    }
    async createInputAssignment(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            const trackingFolio = dto.trackingFolio || this.generateTrackingFolio();
            const assignment = this.inputAssignmentsRepository.create({
                code: this.generateCode("IA"),
                trackingFolio,
                producerId: dto.producerId,
                warehouseId: dto.warehouseId,
                date: dto.date || new Date().toISOString().split('T')[0],
                total,
                notes: dto.notes,
            });
            await queryRunner.manager.save(assignment);
            for (const itemDto of dto.items) {
                const item = this.inputAssignmentItemsRepository.create({
                    assignmentId: assignment.id,
                    productId: itemDto.productId,
                    quantity: itemDto.quantity,
                    price: itemDto.unitPrice,
                    total: itemDto.quantity * itemDto.unitPrice,
                });
                await queryRunner.manager.save(item);
            }
            await this.inventoryService.createMovement({
                type: create_movement_dto_1.MovementType.SALIDA,
                warehouseId: dto.warehouseId,
                reference: `Asignación a productor`,
                notes: dto.notes,
                items: dto.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            });
            const itemsForDescription = await Promise.all(dto.items.map(async (item) => {
                const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                    where: { id: item.productId },
                });
                return {
                    name: product?.name || product?.sku || `Producto ${item.productId}`,
                    quantity: item.quantity
                };
            }));
            let description = "Asignación de insumos";
            if (itemsForDescription.length > 0) {
                const itemsSummary = itemsForDescription
                    .slice(0, 3)
                    .map(item => `${item.name} (${item.quantity})`)
                    .join(", ");
                const remaining = itemsForDescription.length - 3;
                description += `: ${itemsSummary}${remaining > 0 ? ` y ${remaining} más` : ""}`;
            }
            const lastMovement = await queryRunner.manager.findOne(producer_account_movement_entity_1.ProducerAccountMovement, {
                where: { producerId: dto.producerId },
                order: { createdAt: "DESC" },
            });
            const prevBalance = lastMovement ? Number(lastMovement.balance) : 0;
            const newBalance = prevBalance - Number(total);
            const accountMovement = this.accountMovementsRepository.create({
                producerId: dto.producerId,
                type: "cargo",
                amount: total,
                balance: newBalance,
                description: description,
                referenceType: "input_assignment",
                referenceId: assignment.id,
                referenceCode: assignment.code,
            });
            await queryRunner.manager.save(accountMovement);
            await queryRunner.commitTransaction();
            return await this.inputAssignmentsRepository.findOne({
                where: { id: assignment.id },
                relations: ["producer", "warehouse", "items", "items.product"],
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
    async findAllInputAssignments() {
        try {
            return await this.inputAssignmentsRepository.find({
                relations: ["producer", "warehouse", "items", "items.product"],
                order: { createdAt: "DESC" },
            });
        }
        catch (error) {
            console.error("Error in findAllInputAssignments:", error);
            const msg = (error?.message || "").toLowerCase();
            if (msg.includes('warehouse_id') || msg.includes('does not exist') || error?.code === '42703') {
                try {
                    console.warn('Falling back to loading input assignments without warehouse relation');
                    return await this.inputAssignmentsRepository.find({
                        relations: ["producer", "items", "items.product"],
                        order: { createdAt: "DESC" },
                    });
                }
                catch (err2) {
                    console.error('Fallback failed in findAllInputAssignments:', err2);
                    throw new Error(`Failed to fetch input assignments (fallback): ${err2?.message || err2}`);
                }
            }
            throw new Error(`Failed to fetch input assignments: ${error?.message || error}`);
        }
    }
    async updateInputAssignment(id, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const assignment = await this.inputAssignmentsRepository.findOne({
                where: { id },
                relations: ['items', 'items.product']
            });
            if (!assignment) {
                throw new Error('Asignación no encontrada');
            }
            assignment.producerId = dto.producerId;
            assignment.warehouseId = dto.warehouseId;
            assignment.date = dto.date || assignment.date;
            assignment.trackingFolio = dto.trackingFolio || assignment.trackingFolio;
            assignment.notes = dto.notes || assignment.notes;
            const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            assignment.total = total;
            await queryRunner.manager.save(assignment);
            await queryRunner.manager.remove(assignment.items);
            for (const itemDto of dto.items) {
                const item = queryRunner.manager.create(input_assignment_item_entity_1.InputAssignmentItem, {
                    assignmentId: assignment.id,
                    productId: itemDto.productId,
                    quantity: itemDto.quantity,
                    price: itemDto.unitPrice,
                    total: itemDto.quantity * itemDto.unitPrice,
                });
                await queryRunner.manager.save(item);
            }
            const accountMovement = await queryRunner.manager.findOne(producer_account_movement_entity_1.ProducerAccountMovement, {
                where: {
                    referenceCode: assignment.code,
                    referenceType: 'input_assignment'
                }
            });
            if (accountMovement) {
                const previousMovements = await queryRunner.manager.find(producer_account_movement_entity_1.ProducerAccountMovement, {
                    where: { producerId: dto.producerId },
                    order: { createdAt: 'ASC' }
                });
                let balance = 0;
                for (const mov of previousMovements) {
                    if (mov.id === accountMovement.id) {
                        balance = mov.type === 'cargo' ? balance - total : balance + Number(mov.amount);
                        accountMovement.amount = total;
                        accountMovement.balance = balance;
                        await queryRunner.manager.save(accountMovement);
                        break;
                    }
                    else {
                        balance = mov.balance;
                    }
                }
            }
            await queryRunner.commitTransaction();
            return await this.inputAssignmentsRepository.findOne({
                where: { id },
                relations: ['producer', 'warehouse', 'items', 'items.product']
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
    async deleteInputAssignment(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const assignment = await this.inputAssignmentsRepository.findOne({
                where: { id },
                relations: ['items']
            });
            if (!assignment) {
                throw new Error('Asignación no encontrada');
            }
            await queryRunner.manager.delete(producer_account_movement_entity_1.ProducerAccountMovement, {
                referenceCode: assignment.code,
                referenceType: 'input_assignment'
            });
            await queryRunner.manager.remove(assignment.items);
            await queryRunner.manager.remove(assignment);
            await queryRunner.commitTransaction();
            return { message: 'Asignación eliminada correctamente' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createFruitReception(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const reception = this.fruitReceptionsRepository.create({
                code: this.generateCode("FR"),
                producerId: dto.producerId,
                productId: dto.productId,
                warehouseId: dto.warehouseId,
                boxes: dto.boxes,
                date: dto.date || new Date().toISOString().split('T')[0],
                trackingFolio: dto.trackingFolio || null,
                weightPerBox: dto.weightPerBox,
                totalWeight: dto.totalWeight,
                returnedBoxes: dto.returnedBoxes || 0,
                returnedBoxesValue: dto.returnedBoxesValue || 0,
                notes: dto.notes,
                shipmentStatus: "pendiente",
            });
            await queryRunner.manager.save(reception);
            await this.inventoryService.createMovement({
                type: create_movement_dto_1.MovementType.ENTRADA,
                warehouseId: dto.warehouseId,
                reference: `Recepción de fruta - ${reception.id}`,
                notes: dto.notes,
                items: [
                    {
                        productId: dto.productId,
                        quantity: dto.boxes,
                    },
                ],
            });
            if (dto.returnedBoxes && dto.returnedBoxesValue && dto.returnedBoxesValue > 0) {
                const lastMovement = await queryRunner.manager
                    .getRepository(producer_account_movement_entity_1.ProducerAccountMovement)
                    .findOne({
                    where: { producerId: dto.producerId },
                    order: { createdAt: 'DESC' },
                });
                const currentBalance = Number(lastMovement?.balance || 0);
                const newBalance = currentBalance - Number(dto.returnedBoxesValue);
                const accountMovement = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                    producerId: dto.producerId,
                    type: 'abono',
                    amount: dto.returnedBoxesValue,
                    balance: newBalance,
                    description: `Devolución de material de empaque - ${dto.returnedBoxes} cajas (Recepción ${reception.code})`,
                    referenceType: 'fruit_reception',
                    referenceCode: reception.code,
                    date: dto.date || new Date().toISOString().split('T')[0],
                });
                await queryRunner.manager.save(accountMovement);
            }
            await queryRunner.commitTransaction();
            return await this.fruitReceptionsRepository.findOne({
                where: { id: reception.id },
                relations: ["producer", "product", "warehouse"],
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
    async findAllFruitReceptions() {
        return await this.fruitReceptionsRepository.find({
            relations: ["producer", "product", "warehouse", "shipment"],
            order: { createdAt: "DESC" },
        });
    }
    async createShipment(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const receptions = await this.fruitReceptionsRepository.find({ where: { id: (0, typeorm_2.In)(dto.receptionIds) } });
            if (receptions.length !== dto.receptionIds.length) {
                throw new common_1.BadRequestException("Some receptions not found");
            }
            const pendingReceptions = receptions.filter((r) => r.shipmentStatus === "pendiente");
            if (pendingReceptions.length !== receptions.length) {
                throw new common_1.BadRequestException("All receptions must be pending");
            }
            const totalBoxes = receptions.reduce((sum, r) => sum + Number(r.boxes), 0);
            const trackingFolios = [...new Set(receptions.map(r => r.trackingFolio).filter(Boolean))];
            const trackingFolio = trackingFolios.length > 0 ? trackingFolios[0] : null;
            const shipment = this.shipmentsRepository.create({
                code: this.generateCode("SH"),
                date: dto.date || new Date().toISOString().split('T')[0],
                trackingFolio,
                totalBoxes: Number(totalBoxes),
                status: "embarcada",
                carrier: dto.carrier,
                shippedAt: dto.date ? new Date(dto.date) : new Date(),
                notes: dto.notes,
            });
            await queryRunner.manager.save(shipment);
            for (const reception of receptions) {
                reception.shipmentId = shipment.id;
                reception.shipmentStatus = "embarcada";
                await queryRunner.manager.save(reception);
            }
            await queryRunner.commitTransaction();
            return await this.shipmentsRepository.findOne({
                where: { id: shipment.id },
                relations: ["receptions", "receptions.producer", "receptions.product"],
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
    async updateShipmentStatus(id, status, salePrice) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const shipment = await this.shipmentsRepository.findOne({
                where: { id },
                relations: ["receptions", "receptions.producer"],
            });
            if (!shipment) {
                throw new common_1.NotFoundException(`Shipment with ID ${id} not found`);
            }
            shipment.status = status;
            if (status === "recibida") {
                shipment.receivedAt = new Date();
            }
            if (status === "vendida" && salePrice) {
                shipment.salePricePerBox = salePrice;
                shipment.totalSale = Number((Number(shipment.totalBoxes || 0) * Number(salePrice)).toFixed(2));
                for (const reception of shipment.receptions) {
                    const amount = reception.boxes * salePrice;
                    reception.pricePerBox = salePrice;
                    reception.finalTotal = amount;
                    reception.shipmentStatus = "vendida";
                    await queryRunner.manager.save(reception);
                    const lastMovement = await queryRunner.manager.findOne(producer_account_movement_entity_1.ProducerAccountMovement, {
                        where: { producerId: reception.producerId },
                        order: { createdAt: "DESC" },
                    });
                    const prevBalance = lastMovement ? Number(lastMovement.balance) : 0;
                    const newBalance = prevBalance + Number(amount);
                    const accountMovement = this.accountMovementsRepository.create({
                        producerId: reception.producerId,
                        type: "abono",
                        amount,
                        balance: newBalance,
                        description: `Venta de embarque - ${shipment.totalBoxes} cajas a $${salePrice}`,
                        referenceType: "shipment",
                        referenceId: shipment.id,
                        referenceCode: shipment.code,
                    });
                    await queryRunner.manager.save(accountMovement);
                }
            }
            await queryRunner.manager.save(shipment);
            await queryRunner.commitTransaction();
            return await this.shipmentsRepository.findOne({
                where: { id },
                relations: ["receptions", "receptions.producer", "receptions.product"],
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
    async findAllShipments() {
        return await this.shipmentsRepository.find({
            relations: ["receptions", "receptions.producer", "receptions.product"],
            order: { createdAt: "DESC" },
        });
    }
    async getAccountStatement(producerId) {
        const movements = await this.accountMovementsRepository.find({
            where: { producerId },
            order: { createdAt: "ASC" },
        });
        const movementsWithBalance = movements.map((movement) => ({
            ...movement,
            balance: Number(movement.balance),
        }));
        const currentBalance = movements.length > 0 ? Number(movements[movements.length - 1].balance) : 0;
        return {
            movements: movementsWithBalance,
            currentBalance,
        };
    }
    async createPayment(dto) {
        const lastMovement = await this.accountMovementsRepository.findOne({
            where: { producerId: dto.producerId },
            order: { createdAt: "DESC" },
        });
        const prevBalance = lastMovement ? Number(lastMovement.balance) : 0;
        const newBalance = prevBalance + Number(dto.amount);
        const payment = this.accountMovementsRepository.create({
            producerId: dto.producerId,
            type: "pago",
            amount: dto.amount,
            balance: newBalance,
            description: `Pago - ${dto.method}`,
            paymentMethod: dto.method,
            paymentReference: dto.reference,
            notes: dto.notes,
        });
        return await this.accountMovementsRepository.save(payment);
    }
};
exports.ProducersService = ProducersService;
exports.ProducersService = ProducersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producer_entity_1.Producer)),
    __param(1, (0, typeorm_1.InjectRepository)(input_assignment_entity_1.InputAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(input_assignment_item_entity_1.InputAssignmentItem)),
    __param(3, (0, typeorm_1.InjectRepository)(fruit_reception_entity_1.FruitReception)),
    __param(4, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(5, (0, typeorm_1.InjectRepository)(producer_account_movement_entity_1.ProducerAccountMovement)),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function, inventory_service_1.InventoryService,
        typeorm_2.DataSource])
], ProducersService);
//# sourceMappingURL=producers.service.js.map