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
    async create(createProducerDto) {
        const producer = this.producersRepository.create(createProducerDto);
        return await this.producersRepository.save(producer);
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
    async createInputAssignment(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
            const assignment = this.inputAssignmentsRepository.create({
                producerId: dto.producerId,
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
            const accountMovement = this.accountMovementsRepository.create({
                producerId: dto.producerId,
                type: "cargo",
                amount: total,
                description: "Asignación de insumos",
                referenceType: "input_assignment",
                referenceId: assignment.id,
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
        return await this.inputAssignmentsRepository.find({
            relations: ["producer", "warehouse", "items", "items.product"],
            order: { createdAt: "DESC" },
        });
    }
    async createFruitReception(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const reception = this.fruitReceptionsRepository.create({
                ...dto,
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
            const receptions = await this.fruitReceptionsRepository.findByIds(dto.receptionIds);
            if (receptions.length !== dto.receptionIds.length) {
                throw new common_1.BadRequestException("Some receptions not found");
            }
            const pendingReceptions = receptions.filter((r) => r.shipmentStatus === "pendiente");
            if (pendingReceptions.length !== receptions.length) {
                throw new common_1.BadRequestException("All receptions must be pending");
            }
            const totalBoxes = receptions.reduce((sum, r) => sum + r.boxes, 0);
            const shipment = this.shipmentsRepository.create({
                totalBoxes,
                status: "embarcada",
                carrier: dto.carrier,
                shippedAt: new Date(),
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
                    const accountMovement = this.accountMovementsRepository.create({
                        producerId: reception.producerId,
                        type: "abono",
                        amount,
                        description: `Venta de embarque - ${shipment.totalBoxes} cajas a $${salePrice}`,
                        referenceType: "shipment",
                        referenceId: shipment.id,
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
        let balance = 0;
        const movementsWithBalance = movements.map((movement) => {
            if (movement.type === "cargo") {
                balance -= movement.amount;
            }
            else if (movement.type === "abono") {
                balance += movement.amount;
            }
            else if (movement.type === "pago") {
                balance += movement.amount;
            }
            return {
                ...movement,
                balance,
            };
        });
        return {
            movements: movementsWithBalance,
            currentBalance: balance,
        };
    }
    async createPayment(dto) {
        const payment = this.accountMovementsRepository.create({
            producerId: dto.producerId,
            type: "pago",
            amount: dto.amount,
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