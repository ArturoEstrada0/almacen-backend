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
const returned_item_entity_1 = require("./entities/returned-item.entity");
const shipment_entity_1 = require("./entities/shipment.entity");
const producer_account_movement_entity_1 = require("./entities/producer-account-movement.entity");
const payment_report_entity_1 = require("./entities/payment-report.entity");
const payment_report_item_entity_1 = require("./entities/payment-report-item.entity");
const create_payment_report_dto_1 = require("./dto/create-payment-report.dto");
const inventory_service_1 = require("../inventory/inventory.service");
const create_movement_dto_1 = require("../inventory/dto/create-movement.dto");
const product_entity_1 = require("../products/entities/product.entity");
let ProducersService = class ProducersService {
    constructor(producersRepository, inputAssignmentsRepository, inputAssignmentItemsRepository, fruitReceptionsRepository, returnedItemsRepository, shipmentsRepository, accountMovementsRepository, paymentReportsRepository, paymentReportItemsRepository, inventoryService, dataSource) {
        this.producersRepository = producersRepository;
        this.inputAssignmentsRepository = inputAssignmentsRepository;
        this.inputAssignmentItemsRepository = inputAssignmentItemsRepository;
        this.fruitReceptionsRepository = fruitReceptionsRepository;
        this.returnedItemsRepository = returnedItemsRepository;
        this.shipmentsRepository = shipmentsRepository;
        this.accountMovementsRepository = accountMovementsRepository;
        this.paymentReportsRepository = paymentReportsRepository;
        this.paymentReportItemsRepository = paymentReportItemsRepository;
        this.inventoryService = inventoryService;
        this.dataSource = dataSource;
    }
    generateCode(prefix) {
        return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000) + 1000}`;
    }
    async generateTrackingFolio() {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear().toString().slice(-2);
        const datePrefix = `${day}${month}${year}`;
        const assignments = await this.inputAssignmentsRepository
            .createQueryBuilder('assignment')
            .where('assignment.trackingFolio LIKE :prefix', { prefix: `${datePrefix}-%` })
            .orderBy('assignment.trackingFolio', 'DESC')
            .getOne();
        const receptions = await this.fruitReceptionsRepository
            .createQueryBuilder('reception')
            .where('reception.trackingFolio LIKE :prefix', { prefix: `${datePrefix}-%` })
            .orderBy('reception.trackingFolio', 'DESC')
            .getOne();
        const shipments = await this.shipmentsRepository
            .createQueryBuilder('shipment')
            .where('shipment.trackingFolio LIKE :prefix', { prefix: `${datePrefix}-%` })
            .orderBy('shipment.trackingFolio', 'DESC')
            .getOne();
        const allFolios = [
            assignments?.trackingFolio,
            receptions?.trackingFolio,
            shipments?.trackingFolio
        ].filter(Boolean);
        let nextNumber = 1;
        if (allFolios.length > 0) {
            const numbers = allFolios.map(folio => {
                const parts = folio.split('-');
                return parts.length > 1 ? parseInt(parts[1], 10) : 0;
            }).filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        return `${datePrefix}-${nextNumber.toString().padStart(3, '0')}`;
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
            const trackingFolio = dto.trackingFolio || await this.generateTrackingFolio();
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
            if (dto.returnedItems && dto.returnedItems.length > 0) {
                for (const itemDto of dto.returnedItems) {
                    const total = Number(itemDto.quantity) * Number(itemDto.unitPrice);
                    const returnedItem = queryRunner.manager.create(returned_item_entity_1.ReturnedItem, {
                        receptionId: reception.id,
                        productId: itemDto.productId,
                        quantity: itemDto.quantity,
                        unitPrice: itemDto.unitPrice,
                        total,
                    });
                    await queryRunner.manager.save(returnedItem);
                }
            }
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
            const returnedValue = dto.returnedBoxesValue || 0;
            if (returnedValue > 0) {
                const lastMovement = await queryRunner.manager
                    .getRepository(producer_account_movement_entity_1.ProducerAccountMovement)
                    .findOne({
                    where: { producerId: dto.producerId },
                    order: { createdAt: 'DESC' },
                });
                const currentBalance = Number(lastMovement?.balance || 0);
                const newBalance = currentBalance + Number(returnedValue);
                let description = `Devolución de material/insumos`;
                if (dto.returnedItems && dto.returnedItems.length > 0) {
                    const productNames = await Promise.all(dto.returnedItems.slice(0, 2).map(async (item) => {
                        const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                            where: { id: item.productId },
                        });
                        return product?.name || product?.sku || 'Producto';
                    }));
                    const remaining = dto.returnedItems.length - 2;
                    description += `: ${productNames.join(', ')}${remaining > 0 ? ` y ${remaining} más` : ''}`;
                }
                else if (dto.returnedBoxes) {
                    description += ` - ${dto.returnedBoxes} cajas`;
                }
                description += ` (Recepción ${reception.code})`;
                const accountMovement = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                    producerId: dto.producerId,
                    type: 'abono',
                    amount: returnedValue,
                    balance: newBalance,
                    description,
                    referenceType: 'fruit_reception',
                    referenceCode: reception.code,
                    date: dto.date || new Date().toISOString().split('T')[0],
                });
                await queryRunner.manager.save(accountMovement);
            }
            await queryRunner.commitTransaction();
            return await this.fruitReceptionsRepository.findOne({
                where: { id: reception.id },
                relations: ["producer", "product", "warehouse", "returnedItems", "returnedItems.product"],
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
            relations: ["producer", "product", "warehouse", "shipment", "returnedItems", "returnedItems.product"],
            order: { createdAt: "DESC" },
        });
    }
    async updateFruitReception(id, dto) {
        const reception = await this.fruitReceptionsRepository.findOne({
            where: { id },
            relations: ["returnedItems"]
        });
        if (!reception) {
            throw new common_1.NotFoundException(`Fruit reception with ID ${id} not found`);
        }
        if (reception.shipmentStatus !== 'pendiente') {
            throw new common_1.BadRequestException('Cannot edit reception that is already shipped or sold');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (reception.returnedItems && reception.returnedItems.length > 0) {
                await queryRunner.manager.delete(returned_item_entity_1.ReturnedItem, { receptionId: id });
            }
            Object.assign(reception, {
                producerId: dto.producerId,
                productId: dto.productId,
                warehouseId: dto.warehouseId,
                boxes: dto.boxes,
                date: dto.date,
                trackingFolio: dto.trackingFolio,
                weightPerBox: dto.weightPerBox,
                totalWeight: dto.totalWeight,
                returnedBoxes: dto.returnedBoxes || 0,
                returnedBoxesValue: dto.returnedBoxesValue || 0,
                notes: dto.notes,
            });
            await queryRunner.manager.save(reception);
            if (dto.returnedItems && dto.returnedItems.length > 0) {
                for (const itemDto of dto.returnedItems) {
                    const total = Number(itemDto.quantity) * Number(itemDto.unitPrice);
                    const returnedItem = queryRunner.manager.create(returned_item_entity_1.ReturnedItem, {
                        receptionId: reception.id,
                        productId: itemDto.productId,
                        quantity: itemDto.quantity,
                        unitPrice: itemDto.unitPrice,
                        total,
                    });
                    await queryRunner.manager.save(returnedItem);
                }
            }
            await queryRunner.commitTransaction();
            return await this.fruitReceptionsRepository.findOne({
                where: { id },
                relations: ["producer", "product", "warehouse", "returnedItems", "returnedItems.product"],
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
    async deleteFruitReception(id) {
        const reception = await this.fruitReceptionsRepository.findOne({ where: { id } });
        if (!reception) {
            throw new common_1.NotFoundException(`Fruit reception with ID ${id} not found`);
        }
        if (reception.shipmentStatus !== 'pendiente') {
            throw new common_1.BadRequestException('Cannot delete reception that is already shipped or sold');
        }
        await this.fruitReceptionsRepository.remove(reception);
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
                carrierContact: dto.driver,
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
    async updateShipment(id, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const shipment = await this.shipmentsRepository.findOne({
                where: { id },
                relations: ["receptions"]
            });
            if (!shipment) {
                throw new common_1.NotFoundException(`Shipment with ID ${id} not found`);
            }
            if (shipment.status === 'vendida') {
                throw new common_1.BadRequestException('Cannot edit shipment that is already sold');
            }
            if (dto.receptionIds && Array.isArray(dto.receptionIds)) {
                const currentReceptionIds = shipment.receptions.map(r => r.id);
                const receptionsToRemove = currentReceptionIds.filter(id => !dto.receptionIds.includes(id));
                const receptionsToAdd = dto.receptionIds.filter(id => !currentReceptionIds.includes(id));
                for (const receptionId of receptionsToRemove) {
                    const reception = await queryRunner.manager.findOne(fruit_reception_entity_1.FruitReception, { where: { id: receptionId } });
                    if (reception) {
                        reception.shipmentId = null;
                        reception.shipmentStatus = 'pendiente';
                        await queryRunner.manager.save(reception);
                    }
                }
                for (const receptionId of receptionsToAdd) {
                    const reception = await queryRunner.manager.findOne(fruit_reception_entity_1.FruitReception, { where: { id: receptionId } });
                    if (reception) {
                        if (reception.shipmentStatus !== 'pendiente') {
                            throw new common_1.BadRequestException(`Reception ${reception.code} is not available for shipment`);
                        }
                        reception.shipmentId = shipment.id;
                        reception.shipmentStatus = 'embarcada';
                        await queryRunner.manager.save(reception);
                    }
                }
                const allReceptions = await queryRunner.manager.find(fruit_reception_entity_1.FruitReception, {
                    where: { shipmentId: id }
                });
                shipment.totalBoxes = allReceptions.reduce((sum, r) => sum + Number(r.boxes || 0), 0);
            }
            if (dto.carrier)
                shipment.carrier = dto.carrier;
            if (dto.driver !== undefined)
                shipment.carrierContact = dto.driver;
            if (dto.date)
                shipment.date = dto.date;
            if (dto.notes !== undefined)
                shipment.notes = dto.notes;
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
    async deleteShipment(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const shipment = await this.shipmentsRepository.findOne({
                where: { id },
                relations: ["receptions"]
            });
            if (!shipment) {
                throw new common_1.NotFoundException(`Shipment with ID ${id} not found`);
            }
            if (shipment.status === 'vendida') {
                throw new common_1.BadRequestException('Cannot delete shipment that is already sold');
            }
            for (const reception of shipment.receptions) {
                reception.shipmentId = null;
                reception.shipmentStatus = 'pendiente';
                await queryRunner.manager.save(reception);
            }
            await queryRunner.manager.remove(shipment);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAccountStatement(producerId) {
        const movements = await this.accountMovementsRepository.find({
            where: { producerId },
            order: { createdAt: "ASC" },
        });
        const shipmentIds = movements
            .filter(m => m.referenceType === 'shipment' && m.referenceId)
            .map(m => m.referenceId)
            .filter((id, index, self) => self.indexOf(id) === index);
        let paidShipmentIds = [];
        if (shipmentIds.length > 0) {
            const receptions = await this.fruitReceptionsRepository.find({
                where: { shipmentId: (0, typeorm_2.In)(shipmentIds) },
                select: ['id', 'shipmentId', 'paymentStatus']
            });
            const shipmentReceptions = shipmentIds.map(shipmentId => ({
                shipmentId,
                receptions: receptions.filter(r => r.shipmentId === shipmentId)
            }));
            paidShipmentIds = shipmentReceptions
                .filter(sr => sr.receptions.length > 0 && sr.receptions.every(r => r.paymentStatus === 'pagada'))
                .map(sr => sr.shipmentId);
        }
        const filteredMovements = movements.filter(movement => {
            if (movement.referenceType === 'shipment' &&
                movement.referenceId &&
                paidShipmentIds.includes(movement.referenceId) &&
                movement.type === 'abono') {
                return false;
            }
            return true;
        });
        const movementsWithBalance = filteredMovements.map((movement) => ({
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (!dto.selectedMovements || dto.selectedMovements.length === 0) {
                const lastMovement = await queryRunner.manager.findOne(producer_account_movement_entity_1.ProducerAccountMovement, {
                    where: { producerId: dto.producerId },
                    order: { createdAt: "DESC" },
                });
                const prevBalance = lastMovement ? Number(lastMovement.balance) : 0;
                let description = `Pago - ${dto.method}`;
                const payment = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                    producerId: dto.producerId,
                    type: "pago",
                    amount: dto.amount,
                    balance: prevBalance - Number(dto.amount),
                    description,
                    paymentMethod: dto.method,
                    paymentReference: dto.reference,
                    notes: dto.notes,
                });
                await queryRunner.manager.save(payment);
                if (dto.retention && dto.retention.amount > 0) {
                    const newBalance = Number(payment.balance) - Number(dto.retention.amount);
                    const retention = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                        producerId: dto.producerId,
                        type: "cargo",
                        amount: dto.retention.amount,
                        balance: newBalance,
                        description: `Retención - ${dto.retention.notes || "Descuento aplicado"}`,
                        notes: dto.retention.notes,
                    });
                    await queryRunner.manager.save(retention);
                }
                await queryRunner.commitTransaction();
                return payment;
            }
            const movements = await queryRunner.manager.find(producer_account_movement_entity_1.ProducerAccountMovement, {
                where: { id: (0, typeorm_2.In)(dto.selectedMovements) }
            });
            const shipmentMovements = movements.filter(m => m.referenceType === 'shipment' && m.referenceId && m.type === 'abono');
            if (shipmentMovements.length > 0) {
                const shipmentIds = shipmentMovements.map(m => m.referenceId);
                const shipments = await queryRunner.manager.find(shipment_entity_1.Shipment, {
                    where: { id: (0, typeorm_2.In)(shipmentIds) },
                    relations: ['receptions']
                });
                const allReceptionIds = [];
                for (const shipment of shipments) {
                    const receptionIds = shipment.receptions
                        .filter(r => r.producerId === dto.producerId)
                        .map(r => r.id);
                    allReceptionIds.push(...receptionIds);
                }
                if (allReceptionIds.length > 0) {
                    const fruitReceptions = await queryRunner.manager.find(fruit_reception_entity_1.FruitReception, {
                        where: { id: (0, typeorm_2.In)(allReceptionIds) },
                        relations: ['product']
                    });
                    const subtotal = fruitReceptions.reduce((sum, reception) => sum + (reception.boxes * reception.pricePerBox), 0);
                    const retentionAmount = dto.retention?.amount || 0;
                    const totalToPay = subtotal - retentionAmount;
                    const paymentReport = queryRunner.manager.create(payment_report_entity_1.PaymentReport, {
                        code: this.generateCode("PR"),
                        producerId: dto.producerId,
                        date: new Date().toISOString().split('T')[0],
                        subtotal: Number(subtotal.toFixed(2)),
                        retentionAmount: Number(retentionAmount.toFixed(2)),
                        retentionNotes: dto.retention?.notes,
                        totalToPay: Number(totalToPay.toFixed(2)),
                        status: "pendiente",
                        notes: dto.notes,
                        paymentMethod: dto.method,
                    });
                    await queryRunner.manager.save(paymentReport);
                    for (const reception of fruitReceptions) {
                        const item = queryRunner.manager.create(payment_report_item_entity_1.PaymentReportItem, {
                            paymentReportId: paymentReport.id,
                            fruitReceptionId: reception.id,
                            boxes: reception.boxes,
                            pricePerBox: reception.pricePerBox,
                            subtotal: reception.boxes * reception.pricePerBox,
                        });
                        await queryRunner.manager.save(item);
                    }
                    await queryRunner.commitTransaction();
                    return await this.paymentReportsRepository.findOne({
                        where: { id: paymentReport.id },
                        relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
                    });
                }
            }
            await queryRunner.commitTransaction();
            return { success: true };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createPaymentReport(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const subtotal = dto.items.reduce((sum, item) => sum + (item.boxes * item.pricePerBox), 0);
            const retentionAmount = dto.retentionAmount || 0;
            const totalToPay = subtotal - retentionAmount;
            const paymentReport = this.paymentReportsRepository.create({
                code: this.generateCode("PR"),
                producerId: dto.producerId,
                date: dto.date || new Date().toISOString().split('T')[0],
                subtotal: Number(subtotal.toFixed(2)),
                retentionAmount: Number(retentionAmount.toFixed(2)),
                retentionNotes: dto.retentionNotes,
                totalToPay: Number(totalToPay.toFixed(2)),
                status: "pendiente",
                notes: dto.notes,
            });
            await queryRunner.manager.save(paymentReport);
            for (const itemDto of dto.items) {
                const item = this.paymentReportItemsRepository.create({
                    paymentReportId: paymentReport.id,
                    fruitReceptionId: itemDto.fruitReceptionId,
                    boxes: itemDto.boxes,
                    pricePerBox: itemDto.pricePerBox,
                    subtotal: Number((itemDto.boxes * itemDto.pricePerBox).toFixed(2)),
                });
                await queryRunner.manager.save(item);
            }
            await queryRunner.commitTransaction();
            return await this.paymentReportsRepository.findOne({
                where: { id: paymentReport.id },
                relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
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
    async findAllPaymentReports() {
        return await this.paymentReportsRepository.find({
            relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
            order: { createdAt: "DESC" },
        });
    }
    async findOnePaymentReport(id) {
        const report = await this.paymentReportsRepository.findOne({
            where: { id },
            relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
        });
        if (!report) {
            throw new common_1.NotFoundException(`Payment report with ID ${id} not found`);
        }
        return report;
    }
    async updatePaymentReport(id, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const report = await this.paymentReportsRepository.findOne({
                where: { id },
                relations: ["items"]
            });
            if (!report) {
                throw new common_1.NotFoundException(`Payment report with ID ${id} not found`);
            }
            if (report.status === create_payment_report_dto_1.PaymentReportStatus.PAGADO) {
                throw new common_1.BadRequestException('Cannot edit payment report that is already paid');
            }
            await queryRunner.manager.delete(payment_report_item_entity_1.PaymentReportItem, { paymentReportId: id });
            const subtotal = dto.items.reduce((sum, item) => sum + (item.boxes * item.pricePerBox), 0);
            const retentionAmount = dto.retentionAmount || 0;
            const totalToPay = subtotal - retentionAmount;
            report.producerId = dto.producerId;
            report.date = dto.date || report.date;
            report.subtotal = Number(subtotal.toFixed(2));
            report.retentionAmount = Number(retentionAmount.toFixed(2));
            report.retentionNotes = dto.retentionNotes;
            report.totalToPay = Number(totalToPay.toFixed(2));
            report.notes = dto.notes;
            await queryRunner.manager.save(report);
            for (const itemDto of dto.items) {
                const item = this.paymentReportItemsRepository.create({
                    paymentReportId: report.id,
                    fruitReceptionId: itemDto.fruitReceptionId,
                    boxes: itemDto.boxes,
                    pricePerBox: itemDto.pricePerBox,
                    subtotal: Number((itemDto.boxes * itemDto.pricePerBox).toFixed(2)),
                });
                await queryRunner.manager.save(item);
            }
            await queryRunner.commitTransaction();
            return await this.paymentReportsRepository.findOne({
                where: { id },
                relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
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
    async updatePaymentReportStatus(id, dto) {
        const report = await this.paymentReportsRepository.findOne({ where: { id }, relations: ["items", "items.fruitReception"] });
        if (!report) {
            throw new common_1.NotFoundException(`Payment report with ID ${id} not found`);
        }
        if (dto.status === create_payment_report_dto_1.PaymentReportStatus.PAGADO) {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const rpt = await queryRunner.manager.findOne(payment_report_entity_1.PaymentReport, { where: { id }, relations: ["items", "items.fruitReception"] });
                if (!rpt)
                    throw new common_1.NotFoundException(`Payment report with ID ${id} not found`);
                const subtotal = rpt.subtotal || 0;
                const retentionAmount = rpt.retentionAmount || 0;
                const isrAmount = dto.isrAmount || 0;
                const paymentAmount = Number((subtotal - retentionAmount - isrAmount).toFixed(2));
                const lastMovement = await queryRunner.manager.findOne(producer_account_movement_entity_1.ProducerAccountMovement, {
                    where: { producerId: rpt.producerId },
                    order: { createdAt: "DESC" },
                });
                let newBalance = lastMovement ? Number(lastMovement.balance) : 0;
                if (paymentAmount > 0) {
                    newBalance = newBalance - paymentAmount;
                    const paymentMove = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                        producerId: rpt.producerId,
                        type: "pago",
                        amount: paymentAmount,
                        balance: newBalance,
                        description: `Pago reporte ${rpt.code}`,
                        paymentMethod: dto.paymentMethod,
                        paymentReference: dto.paymentReference,
                        notes: dto.notes,
                        referenceType: 'payment_report',
                        referenceId: rpt.id,
                    });
                    await queryRunner.manager.save(paymentMove);
                }
                if (retentionAmount > 0) {
                    newBalance = newBalance - retentionAmount;
                    const retentionMove = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                        producerId: rpt.producerId,
                        type: "cargo",
                        amount: retentionAmount,
                        balance: newBalance,
                        description: `Retención - ${rpt.retentionNotes || "Descuento aplicado"}`,
                        notes: rpt.retentionNotes,
                        referenceType: 'payment_report',
                        referenceId: rpt.id,
                    });
                    await queryRunner.manager.save(retentionMove);
                }
                if (isrAmount > 0) {
                    newBalance = newBalance - isrAmount;
                    const isrMove = queryRunner.manager.create(producer_account_movement_entity_1.ProducerAccountMovement, {
                        producerId: rpt.producerId,
                        type: "cargo",
                        amount: isrAmount,
                        balance: newBalance,
                        description: `ISR retenido - Pago reporte ${rpt.code}`,
                        notes: `ISR retenido: ${isrAmount}`,
                        referenceType: 'payment_report',
                        referenceId: rpt.id,
                    });
                    await queryRunner.manager.save(isrMove);
                }
                rpt.status = create_payment_report_dto_1.PaymentReportStatus.PAGADO;
                rpt.paidAt = new Date();
                if (dto.paymentMethod)
                    rpt.paymentMethod = dto.paymentMethod;
                if (dto.paymentReference)
                    rpt.paymentReference = dto.paymentReference;
                if (dto.notes)
                    rpt.notes = dto.notes;
                if (dto.invoiceUrl)
                    rpt.invoiceUrl = dto.invoiceUrl;
                if (dto.receiptUrl)
                    rpt.receiptUrl = dto.receiptUrl;
                if (dto.paymentComplementUrl)
                    rpt.paymentComplementUrl = dto.paymentComplementUrl;
                if (typeof dto.isrAmount === 'number')
                    rpt.isrAmount = Number(dto.isrAmount.toFixed(2));
                await queryRunner.manager.save(rpt);
                for (const item of rpt.items || []) {
                    if (item.fruitReception) {
                        const reception = await queryRunner.manager.findOne(fruit_reception_entity_1.FruitReception, { where: { id: item.fruitReception.id } });
                        if (reception) {
                            reception.paymentStatus = 'pagada';
                            await queryRunner.manager.save(reception);
                        }
                    }
                }
                await queryRunner.commitTransaction();
                return await this.paymentReportsRepository.findOne({
                    where: { id },
                    relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
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
        report.status = dto.status;
        if (dto.paymentMethod)
            report.paymentMethod = dto.paymentMethod;
        if (dto.notes)
            report.notes = dto.notes;
        await this.paymentReportsRepository.save(report);
        return await this.paymentReportsRepository.findOne({
            where: { id },
            relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
        });
    }
    async deletePaymentReport(id) {
        const report = await this.paymentReportsRepository.findOne({ where: { id } });
        if (!report) {
            throw new common_1.NotFoundException(`Payment report with ID ${id} not found`);
        }
        if (report.status === create_payment_report_dto_1.PaymentReportStatus.PAGADO) {
            throw new common_1.BadRequestException('Cannot delete payment report that is already paid');
        }
        await this.paymentReportsRepository.remove(report);
    }
};
exports.ProducersService = ProducersService;
exports.ProducersService = ProducersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producer_entity_1.Producer)),
    __param(1, (0, typeorm_1.InjectRepository)(input_assignment_entity_1.InputAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(input_assignment_item_entity_1.InputAssignmentItem)),
    __param(3, (0, typeorm_1.InjectRepository)(fruit_reception_entity_1.FruitReception)),
    __param(4, (0, typeorm_1.InjectRepository)(returned_item_entity_1.ReturnedItem)),
    __param(5, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(6, (0, typeorm_1.InjectRepository)(producer_account_movement_entity_1.ProducerAccountMovement)),
    __param(7, (0, typeorm_1.InjectRepository)(payment_report_entity_1.PaymentReport)),
    __param(8, (0, typeorm_1.InjectRepository)(payment_report_item_entity_1.PaymentReportItem)),
    __metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function, Function, Function, Function, inventory_service_1.InventoryService,
        typeorm_2.DataSource])
], ProducersService);
//# sourceMappingURL=producers.service.js.map