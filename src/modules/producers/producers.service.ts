import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource } from "typeorm"
import { Producer } from "./entities/producer.entity"
import { InputAssignment } from "./entities/input-assignment.entity"
import { InputAssignmentItem } from "./entities/input-assignment-item.entity"
import { FruitReception } from "./entities/fruit-reception.entity"
import { Shipment } from "./entities/shipment.entity"
import { ProducerAccountMovement } from "./entities/producer-account-movement.entity"
import type { CreateProducerDto } from "./dto/create-producer.dto"
import type { CreateInputAssignmentDto } from "./dto/create-input-assignment.dto"
import type { CreateFruitReceptionDto } from "./dto/create-fruit-reception.dto"
import type { CreateShipmentDto } from "./dto/create-shipment.dto"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import { InventoryService } from "../inventory/inventory.service"
import { MovementType } from "../inventory/dto/create-movement.dto"

@Injectable()
export class ProducersService {
  private producersRepository: Repository<Producer>
  private inputAssignmentsRepository: Repository<InputAssignment>
  private inputAssignmentItemsRepository: Repository<InputAssignmentItem>
  private fruitReceptionsRepository: Repository<FruitReception>
  private shipmentsRepository: Repository<Shipment>
  private accountMovementsRepository: Repository<ProducerAccountMovement>
  private inventoryService: InventoryService
  private dataSource: DataSource

  constructor(
    @InjectRepository(Producer)
    producersRepository: Repository<Producer>,
    @InjectRepository(InputAssignment)
    inputAssignmentsRepository: Repository<InputAssignment>,
    @InjectRepository(InputAssignmentItem)
    inputAssignmentItemsRepository: Repository<InputAssignmentItem>,
    @InjectRepository(FruitReception)
    fruitReceptionsRepository: Repository<FruitReception>,
    @InjectRepository(Shipment)
    shipmentsRepository: Repository<Shipment>,
    @InjectRepository(ProducerAccountMovement)
    accountMovementsRepository: Repository<ProducerAccountMovement>,
    inventoryService: InventoryService,
    dataSource: DataSource,
  ) {
    this.producersRepository = producersRepository
    this.inputAssignmentsRepository = inputAssignmentsRepository
    this.inputAssignmentItemsRepository = inputAssignmentItemsRepository
    this.fruitReceptionsRepository = fruitReceptionsRepository
    this.shipmentsRepository = shipmentsRepository
    this.accountMovementsRepository = accountMovementsRepository
    this.inventoryService = inventoryService
    this.dataSource = dataSource
  }

  // Producers CRUD
  async create(createProducerDto: CreateProducerDto): Promise<Producer> {
    const producer = this.producersRepository.create(createProducerDto)
    return await this.producersRepository.save(producer)
  }

  async findAll(): Promise<Producer[]> {
    return await this.producersRepository.find({
      order: { name: "ASC" },
    })
  }

  async findOne(id: string): Promise<Producer> {
    const producer = await this.producersRepository.findOne({
      where: { id },
      relations: ["inputAssignments", "fruitReceptions", "accountMovements"],
    })

    if (!producer) {
      throw new NotFoundException(`Producer with ID ${id} not found`)
    }

    return producer
  }

  // Input Assignments
  async createInputAssignment(dto: CreateInputAssignmentDto): Promise<InputAssignment> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      const assignment = this.inputAssignmentsRepository.create({
        producerId: dto.producerId,
        total,
        notes: dto.notes,
      })
      await queryRunner.manager.save(assignment)

      for (const itemDto of dto.items) {
        const item = this.inputAssignmentItemsRepository.create({
          assignmentId: assignment.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          price: itemDto.unitPrice,
          total: itemDto.quantity * itemDto.unitPrice,
        })
        await queryRunner.manager.save(item)
      }

      // Create inventory movement (salida)
      await this.inventoryService.createMovement({
        type: MovementType.SALIDA,
        warehouseId: dto.warehouseId,
        reference: `Asignación a productor`,
        notes: dto.notes,
        items: dto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })

      // Create account movement (debit - producer owes)
      const accountMovement = this.accountMovementsRepository.create({
        producerId: dto.producerId,
        type: "cargo",
        amount: total,
        description: "Asignación de insumos",
        referenceType: "input_assignment",
        referenceId: assignment.id,
      } as any)
      await queryRunner.manager.save(accountMovement)

      await queryRunner.commitTransaction()

      return await this.inputAssignmentsRepository.findOne({
        where: { id: assignment.id },
        relations: ["producer", "warehouse", "items", "items.product"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAllInputAssignments(): Promise<InputAssignment[]> {
    return await this.inputAssignmentsRepository.find({
      relations: ["producer", "warehouse", "items", "items.product"],
      order: { createdAt: "DESC" },
    })
  }

  // Fruit Receptions
  async createFruitReception(dto: CreateFruitReceptionDto): Promise<FruitReception> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const reception = this.fruitReceptionsRepository.create({
        ...dto,
        shipmentStatus: "pendiente",
      })
      await queryRunner.manager.save(reception)

      // Create inventory movement (entrada)
      await this.inventoryService.createMovement({
        type: MovementType.ENTRADA,
        warehouseId: dto.warehouseId,
        reference: `Recepción de fruta - ${reception.id}`,
        notes: dto.notes,
        items: [
          {
            productId: dto.productId,
            quantity: dto.boxes,
          },
        ],
      })

      await queryRunner.commitTransaction()

      return await this.fruitReceptionsRepository.findOne({
        where: { id: reception.id },
        relations: ["producer", "product", "warehouse"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAllFruitReceptions(): Promise<FruitReception[]> {
    return await this.fruitReceptionsRepository.find({
      relations: ["producer", "product", "warehouse", "shipment"],
      order: { createdAt: "DESC" },
    })
  }

  // Shipments
  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const receptions = await this.fruitReceptionsRepository.findByIds(dto.receptionIds)

      if (receptions.length !== dto.receptionIds.length) {
        throw new BadRequestException("Some receptions not found")
      }

      const pendingReceptions = receptions.filter((r) => r.shipmentStatus === "pendiente")
      if (pendingReceptions.length !== receptions.length) {
        throw new BadRequestException("All receptions must be pending")
      }

      const totalBoxes = receptions.reduce((sum, r) => sum + r.boxes, 0)

      const shipment = this.shipmentsRepository.create({
        totalBoxes,
        status: "embarcada",
        carrier: dto.carrier,
        shippedAt: new Date(),
        notes: dto.notes,
      })
      await queryRunner.manager.save(shipment)

      for (const reception of receptions) {
        reception.shipmentId = shipment.id
        reception.shipmentStatus = "embarcada"
        await queryRunner.manager.save(reception)
      }

      await queryRunner.commitTransaction()

      return await this.shipmentsRepository.findOne({
        where: { id: shipment.id },
        relations: ["receptions", "receptions.producer", "receptions.product"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async updateShipmentStatus(id: string, status: 'embarcada' | 'recibida' | 'vendida', salePrice?: number): Promise<Shipment> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const shipment = await this.shipmentsRepository.findOne({
        where: { id },
        relations: ["receptions", "receptions.producer"],
      })

      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`)
      }

      shipment.status = status

      if (status === "recibida") {
        shipment.receivedAt = new Date()
      }

      if (status === "vendida" && salePrice) {
        // Save sale price per box and total sale on shipment
        shipment.salePricePerBox = salePrice
        shipment.totalSale = Number((Number(shipment.totalBoxes || 0) * Number(salePrice)).toFixed(2))

        // Create account movements for each producer (abono - we owe them)
        for (const reception of shipment.receptions) {
          const amount = reception.boxes * salePrice
          reception.pricePerBox = salePrice
          reception.finalTotal = amount
          reception.shipmentStatus = "vendida"
          await queryRunner.manager.save(reception)

            const accountMovement = this.accountMovementsRepository.create({
              producerId: reception.producerId,
              type: "abono",
              amount,
              description: `Venta de embarque - ${shipment.totalBoxes} cajas a $${salePrice}`,
              referenceType: "shipment",
              referenceId: shipment.id,
            } as any)
          await queryRunner.manager.save(accountMovement)
        }
      }

      await queryRunner.manager.save(shipment)
      await queryRunner.commitTransaction()

      return await this.shipmentsRepository.findOne({
        where: { id },
        relations: ["receptions", "receptions.producer", "receptions.product"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAllShipments(): Promise<Shipment[]> {
    return await this.shipmentsRepository.find({
      relations: ["receptions", "receptions.producer", "receptions.product"],
      order: { createdAt: "DESC" },
    })
  }

  // Account Statements
  async getAccountStatement(producerId: string) {
    const movements = await this.accountMovementsRepository.find({
      where: { producerId },
      order: { createdAt: "ASC" },
    })

    let balance = 0
    const movementsWithBalance = movements.map((movement) => {
      if (movement.type === "cargo") {
        balance -= movement.amount
      } else if (movement.type === "abono") {
        balance += movement.amount
      } else if (movement.type === "pago") {
        balance += movement.amount
      }

      return {
        ...movement,
        balance,
      }
    })

    return {
      movements: movementsWithBalance,
      currentBalance: balance,
    }
  }

  // Payments
  async createPayment(dto: CreatePaymentDto): Promise<ProducerAccountMovement> {
    const payment = this.accountMovementsRepository.create({
      producerId: dto.producerId,
      type: "pago",
      amount: dto.amount,
      description: `Pago - ${dto.method}`,
      paymentMethod: dto.method,
      paymentReference: dto.reference,
      notes: dto.notes,
    } as any)

    return await this.accountMovementsRepository.save(payment as any)
  }
}
