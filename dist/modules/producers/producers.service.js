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
            const assignment = this.inputAssignmentsRepository.create({
                code: this.generateCode("IA"),
                producerId: dto.producerId,
                warehouseId: dto.warehouseId,
                date: new Date(),
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
                description: "Asignación de insumos",
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
            try {
                console.error('Error in createInputAssignment:', error);
                if (error?.stack)
                    console.error(error.stack);
            }
            catch (logErr) {
                console.error('Failed to log createInputAssignment error:', logErr);
            }
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
    async createFruitReception(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const boxes = Number(dto.boxes) || 0;
            const weightPerBox = dto.weightPerBox !== undefined ? Number(dto.weightPerBox) : undefined;
            let totalWeight = dto.totalWeight !== undefined ? Number(dto.totalWeight) : undefined;
            if (totalWeight === undefined && weightPerBox !== undefined) {
                totalWeight = Number((boxes * weightPerBox).toFixed(2));
            }
            const receptionDate = dto.date ? new Date(dto.date) : new Date();
            const reception = this.fruitReceptionsRepository.create({
                code: this.generateCode("FR"),
                producerId: dto.producerId,
                productId: dto.productId,
                warehouseId: dto.warehouseId,
                boxes,
                weightPerBox,
                totalWeight,
                date: receptionDate,
                notes: dto.notes,
                quality: dto.quality,
                shipmentStatus: "pendiente",
            });
            const savedReception = await queryRunner.manager.save(reception);
            await this.inventoryService.createMovement({
                type: create_movement_dto_1.MovementType.ENTRADA,
                warehouseId: dto.warehouseId,
                reference: `Recepción de fruta - ${savedReception.id}`,
                notes: dto.notes,
                items: [
                    {
                        productId: dto.productId,
                        quantity: dto.boxes,
                    },
                ],
            });
            await queryRunner.commitTransaction();
            return await this.fruitReceptionsRepository.findOne({
                where: { id: savedReception.id },
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
        try {
            return await this.fruitReceptionsRepository.find({
                relations: ["producer", "product", "warehouse", "shipment"],
                order: { createdAt: "DESC" },
            });
        }
        catch (error) {
            console.error('Error in findAllFruitReceptions:', error);
            const msg = (error?.message || '').toLowerCase();
            if (msg.includes('total_weight') || msg.includes('does not exist') || error?.code === '42703') {
                try {
                    console.warn('Falling back to loading fruit receptions without shipment relation');
                    return await this.fruitReceptionsRepository.find({
                        relations: ["producer", "product", "warehouse"],
                        order: { createdAt: "DESC" },
                    });
                }
                catch (err2) {
                    console.error('Fallback failed in findAllFruitReceptions:', err2);
                    throw new Error(`Failed to fetch fruit receptions (fallback): ${err2?.message || err2}`);
                }
            }
            throw new Error(`Failed to fetch fruit receptions: ${error?.message || error}`);
        }
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
            const totalBoxes = receptions.reduce((sum, r) => sum + r.boxes, 0);
            const totalWeight = receptions.reduce((sum, r) => {
                const rt = r.totalWeight !== undefined && r.totalWeight !== null ? Number(r.totalWeight) : undefined;
                if (rt !== undefined && !Number.isNaN(rt))
                    return sum + rt;
                const wpb = r.weightPerBox !== undefined && r.weightPerBox !== null ? Number(r.weightPerBox) : undefined;
                const boxes = r.boxes !== undefined && r.boxes !== null ? Number(r.boxes) : 0;
                if (wpb !== undefined && !Number.isNaN(wpb))
                    return sum + boxes * wpb;
                return sum;
            }, 0);
            const shipmentPayload = {
                code: this.generateCode("SH"),
                date: new Date(),
                totalBoxes,
                totalWeight: Number(totalWeight.toFixed(2)),
                status: "embarcada",
                carrier: dto.carrier,
                shippedAt: new Date(),
                notes: dto.notes,
            };
            let shipment;
            try {
                shipment = this.shipmentsRepository.create(shipmentPayload);
                await queryRunner.manager.save(shipment);
            }
            catch (saveErr) {
                const msg = (saveErr?.message || "").toLowerCase();
                if (msg.includes('total_weight') || msg.includes('does not exist') || saveErr?.code === '42703') {
                    console.warn('Database missing shipments.total_weight, saving shipment without totalWeight column');
                    delete shipmentPayload.totalWeight;
                    shipment = this.shipmentsRepository.create(shipmentPayload);
                    await queryRunner.manager.save(shipment);
                }
                else {
                    throw saveErr;
                }
            }
            for (const reception of receptions) {
                reception.shipmentId = shipment.id;
                reception.shipmentStatus = "embarcada";
                await queryRunner.manager.save(reception);
            }
            await queryRunner.commitTransaction();
            const savedShipment = await this.shipmentsRepository.findOne({
                where: { id: shipment.id },
                relations: ["receptions", "receptions.producer", "receptions.product"],
            });
            if (savedShipment) {
                const hasServerTotal = savedShipment.totalWeight !== undefined && savedShipment.totalWeight !== null;
                if (!hasServerTotal) {
                    try {
                        ;
                        savedShipment.totalWeight = Number(totalWeight.toFixed(2));
                    }
                    catch (e) {
                        ;
                        savedShipment.totalWeight = totalWeight;
                    }
                }
                try {
                    if (savedShipment.totalWeight !== undefined && savedShipment.totalWeight !== null) {
                        savedShipment.totalWeight = Number(savedShipment.totalWeight);
                    }
                }
                catch (e) {
                }
                try {
                    if (savedShipment.totalBoxes !== undefined && savedShipment.totalBoxes !== null) {
                        savedShipment.totalBoxes = Number(savedShipment.totalBoxes);
                    }
                }
                catch (e) { }
                if (Array.isArray(savedShipment.receptions)) {
                    for (const r of savedShipment.receptions) {
                        if (!r)
                            continue;
                        if (r.boxes !== undefined && r.boxes !== null)
                            r.boxes = Number(r.boxes);
                        if (r.totalWeight !== undefined && r.totalWeight !== null)
                            r.totalWeight = Number(r.totalWeight);
                    }
                }
            }
            return savedShipment;
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
        try {
            const raw = await this.shipmentsRepository.find({
                relations: ["receptions", "receptions.producer", "receptions.product"],
                order: { createdAt: "DESC" },
            });
            const normalized = raw.map((s) => {
                try {
                    if (s.totalWeight !== undefined && s.totalWeight !== null)
                        s.totalWeight = Number(s.totalWeight);
                }
                catch (e) { }
                try {
                    if (s.totalBoxes !== undefined && s.totalBoxes !== null)
                        s.totalBoxes = Number(s.totalBoxes);
                }
                catch (e) { }
                if (Array.isArray(s.receptions)) {
                    s.receptionIds = s.receptions.map((r) => r.id);
                    for (const r of s.receptions) {
                        if (!r)
                            continue;
                        if (r.boxes !== undefined && r.boxes !== null)
                            r.boxes = Number(r.boxes);
                        if (r.totalWeight !== undefined && r.totalWeight !== null)
                            r.totalWeight = Number(r.totalWeight);
                    }
                }
                return s;
            });
            return normalized;
        }
        catch (error) {
            console.error('Error in findAllShipments:', error);
            const msg = (error?.message || '').toLowerCase();
            if (msg.includes('total_weight') || msg.includes('does not exist') || error?.code === '42703') {
                try {
                    console.warn('Falling back to loading shipments without total_weight column or relations');
                    const rawShipments = await this.shipmentsRepository
                        .createQueryBuilder('s')
                        .select([
                        's.id',
                        's.code',
                        's.date',
                        's.status',
                        's.total_boxes',
                        's.carrier',
                        's.shipped_at',
                        's.received_at',
                        's.sale_price_per_box',
                        's.total_sale',
                        's.notes',
                        's.created_at',
                        's.updated_at',
                    ])
                        .orderBy('s.created_at', 'DESC')
                        .getRawMany();
                    const shipmentsPartial = rawShipments.map((r) => ({
                        id: r.s_id,
                        code: r.s_code,
                        date: r.s_date,
                        status: r.s_status,
                        totalBoxes: r.s_total_boxes !== null ? Number(r.s_total_boxes) : undefined,
                        carrier: r.s_carrier,
                        shippedAt: r.s_shipped_at,
                        receivedAt: r.s_received_at,
                        salePricePerBox: r.s_sale_price_per_box !== null ? Number(r.s_sale_price_per_box) : undefined,
                        totalSale: r.s_total_sale !== null ? Number(r.s_total_sale) : undefined,
                        notes: r.s_notes,
                        createdAt: r.s_created_at,
                        updatedAt: r.s_updated_at,
                    }));
                    const shipmentIds = shipmentsPartial.map((s) => s.id);
                    let receptions = [];
                    try {
                        receptions = await this.fruitReceptionsRepository.find({
                            where: { shipmentId: (0, typeorm_2.In)(shipmentIds) },
                            relations: ["producer", "product", "warehouse"],
                        });
                    }
                    catch (receptionErr) {
                        console.warn('Could not load receptions during shipments fallback:', receptionErr);
                        receptions = [];
                    }
                    return shipmentsPartial.map((s) => {
                        const reps = receptions.filter((r) => r.shipmentId === s.id);
                        return {
                            ...s,
                            receptions: reps,
                            receptionIds: reps.map((r) => r.id),
                            totalBoxes: typeof s.totalBoxes === 'number' && !isNaN(s.totalBoxes)
                                ? s.totalBoxes
                                : reps.reduce((sum, r) => sum + (Number(r.boxes) || 0), 0),
                            totalWeight: reps.reduce((sum, r) => {
                                const rt = r.totalWeight !== undefined && r.totalWeight !== null ? Number(r.totalWeight) : undefined;
                                if (rt !== undefined && !Number.isNaN(rt))
                                    return sum + rt;
                                const wpb = r.weightPerBox !== undefined && r.weightPerBox !== null ? Number(r.weightPerBox) : undefined;
                                const boxes = r.boxes !== undefined && r.boxes !== null ? Number(r.boxes) : 0;
                                if (wpb !== undefined && !Number.isNaN(wpb))
                                    return sum + boxes * wpb;
                                return sum;
                            }, 0),
                        };
                    });
                }
                catch (err2) {
                    console.error('Fallback failed in findAllShipments:', err2);
                    throw new Error(`Failed to fetch shipments (fallback): ${err2?.message || err2}`);
                }
            }
            throw new Error(`Failed to fetch shipments: ${error?.message || error}`);
        }
    }
    async getAccountStatement(producerId) {
        const movements = await this.accountMovementsRepository.find({
            where: { producerId },
            order: { createdAt: "ASC" },
        });
        let balance = 0;
        const movementsWithBalance = movements.map((movement) => {
            const amt = Number(movement.amount) || 0;
            if (movement.type === "cargo") {
                balance -= amt;
            }
            else if (movement.type === "abono") {
                balance += amt;
            }
            else if (movement.type === "pago") {
                balance -= amt;
            }
            return {
                ...movement,
                amount: amt,
                balance,
            };
        });
        return {
            movements: movementsWithBalance,
            currentBalance: balance,
        };
    }
    async createPayment(dto) {
        const lastMovement = await this.accountMovementsRepository.findOne({
            where: { producerId: dto.producerId },
            order: { createdAt: "DESC" },
        });
        const prevBalance = lastMovement ? Number(lastMovement.balance) : 0;
        const amt = Number(dto.amount) || 0;
        const movementType = dto.type || "pago";
        let newBalance = prevBalance;
        if (movementType === "abono") {
            newBalance = prevBalance + amt;
        }
        else {
            newBalance = prevBalance - amt;
        }
        const movement = this.accountMovementsRepository.create({
            producerId: dto.producerId,
            type: movementType,
            amount: amt,
            balance: newBalance,
            description: movementType === "abono" ? `Abono` : movementType === "pago" ? `Pago - ${dto.method || ""}` : `Devolución`,
            paymentMethod: dto.method,
            paymentReference: dto.reference,
            notes: dto.notes,
        });
        return await this.accountMovementsRepository.save(movement);
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