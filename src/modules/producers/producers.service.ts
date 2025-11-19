import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource, In } from "typeorm"
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
import { Product } from "../products/entities/product.entity"

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

  private generateCode(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000) + 1000}`
  }

  private generateTrackingFolio() {
    // Formato más simple: año(2 dígitos) + mes + día + contador aleatorio de 3 dígitos
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 900 + 100) // 100-999
    return `${year}${month}${day}-${random}`
  }

  // Producers CRUD
  async create(createProducerDto: CreateProducerDto): Promise<Producer> {
    // Map taxId -> rfc if provided in DTO
    const payload: any = { ...createProducerDto }
    if ((createProducerDto as any).taxId) {
      payload.rfc = (createProducerDto as any).taxId
    }

    const producer = this.producersRepository.create(payload)
    const saved = await this.producersRepository.save(producer as any)
    return saved as Producer
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

  async updateProducer(id: string, updateProducerDto: any): Promise<Producer> {
    const producer = await this.producersRepository.findOne({ where: { id } })
    if (!producer) {
      throw new NotFoundException(`Producer with ID ${id} not found`)
    }
    Object.assign(producer, updateProducerDto)
    return await this.producersRepository.save(producer)
  }

  // Input Assignments
  async createInputAssignment(dto: CreateInputAssignmentDto): Promise<InputAssignment> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      const trackingFolio = dto.trackingFolio || this.generateTrackingFolio()

      const assignment = this.inputAssignmentsRepository.create({
        code: this.generateCode("IA"),
        trackingFolio,
        producerId: dto.producerId,
        warehouseId: dto.warehouseId,
        date: dto.date || new Date().toISOString().split('T')[0],
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
      // Build detailed description with product names and quantities
      const itemsForDescription = await Promise.all(
        dto.items.map(async (item) => {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          })
          return {
            name: product?.name || product?.sku || `Producto ${item.productId}`,
            quantity: item.quantity
          }
        })
      )
      
      let description = "Asignación de insumos"
      if (itemsForDescription.length > 0) {
        const itemsSummary = itemsForDescription
          .slice(0, 3) // Mostrar hasta 3 productos
          .map(item => `${item.name} (${item.quantity})`)
          .join(", ")
        const remaining = itemsForDescription.length - 3
        description += `: ${itemsSummary}${remaining > 0 ? ` y ${remaining} más` : ""}`
      }
      
      // compute previous balance
      const lastMovement = await queryRunner.manager.findOne(ProducerAccountMovement, {
        where: { producerId: dto.producerId },
        order: { createdAt: "DESC" },
      })
      const prevBalance = lastMovement ? Number(lastMovement.balance) : 0
      const newBalance = prevBalance - Number(total)

      const accountMovement = this.accountMovementsRepository.create({
        producerId: dto.producerId,
        type: "cargo",
        amount: total,
        balance: newBalance,
        description: description,
        referenceType: "input_assignment",
        referenceId: assignment.id,
        referenceCode: assignment.code,
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
    try {
      return await this.inputAssignmentsRepository.find({
        relations: ["producer", "warehouse", "items", "items.product"],
        order: { createdAt: "DESC" },
      })
    } catch (error: any) {
      // If the DB doesn't have the warehouse column, try a fallback without the warehouse relation
      console.error("Error in findAllInputAssignments:", error)

      // Specific handling for missing column errors coming from Postgres / TypeORM
      const msg = (error?.message || "").toLowerCase()
      if (msg.includes('warehouse_id') || msg.includes('does not exist') || error?.code === '42703') {
        try {
          console.warn('Falling back to loading input assignments without warehouse relation')
          return await this.inputAssignmentsRepository.find({
            relations: ["producer", "items", "items.product"],
            order: { createdAt: "DESC" },
          })
        } catch (err2) {
          console.error('Fallback failed in findAllInputAssignments:', err2)
          throw new Error(`Failed to fetch input assignments (fallback): ${(err2 as any)?.message || err2}`)
        }
      }

      throw new Error(`Failed to fetch input assignments: ${(error as any)?.message || error}`)
    }
  }

  async updateInputAssignment(id: string, dto: CreateInputAssignmentDto): Promise<InputAssignment> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const assignment = await this.inputAssignmentsRepository.findOne({ 
        where: { id },
        relations: ['items', 'items.product']
      })
      
      if (!assignment) {
        throw new Error('Asignación no encontrada')
      }

      // Actualizar campos básicos
      assignment.producerId = dto.producerId
      assignment.warehouseId = dto.warehouseId
      assignment.date = dto.date || assignment.date
      assignment.trackingFolio = dto.trackingFolio || assignment.trackingFolio
      assignment.notes = dto.notes || assignment.notes

      // Calcular nuevo total
      const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      assignment.total = total

      // Guardar assignment primero
      await queryRunner.manager.save(assignment)

      // Eliminar items antiguos
      await queryRunner.manager.remove(assignment.items)

      // Crear nuevos items
      for (const itemDto of dto.items) {
        const item = queryRunner.manager.create(InputAssignmentItem, {
          assignmentId: assignment.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          price: itemDto.unitPrice,
          total: itemDto.quantity * itemDto.unitPrice,
        })
        await queryRunner.manager.save(item)
      }

      // Actualizar movimiento de cuenta
      const accountMovement = await queryRunner.manager.findOne(ProducerAccountMovement, {
        where: { 
          referenceCode: assignment.code,
          referenceType: 'input_assignment'
        }
      })

      if (accountMovement) {
        // Recalcular balance
        const previousMovements = await queryRunner.manager.find(ProducerAccountMovement, {
          where: { producerId: dto.producerId },
          order: { createdAt: 'ASC' }
        })

        let balance = 0
        for (const mov of previousMovements) {
          if (mov.id === accountMovement.id) {
            balance = mov.type === 'cargo' ? balance - total : balance + Number(mov.amount)
            accountMovement.amount = total
            accountMovement.balance = balance
            await queryRunner.manager.save(accountMovement)
            break
          } else {
            balance = mov.balance
          }
        }
      }

      await queryRunner.commitTransaction()

      return await this.inputAssignmentsRepository.findOne({
        where: { id },
        relations: ['producer', 'warehouse', 'items', 'items.product']
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async deleteInputAssignment(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const assignment = await this.inputAssignmentsRepository.findOne({ 
        where: { id },
        relations: ['items']
      })
      
      if (!assignment) {
        throw new Error('Asignación no encontrada')
      }

      // Eliminar movimiento de cuenta asociado
      await queryRunner.manager.delete(ProducerAccountMovement, {
        referenceCode: assignment.code,
        referenceType: 'input_assignment'
      })

      // Eliminar items
      await queryRunner.manager.remove(assignment.items)

      // Eliminar asignación
      await queryRunner.manager.remove(assignment)

      await queryRunner.commitTransaction()

      return { message: 'Asignación eliminada correctamente' }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Fruit Receptions
  async createFruitReception(dto: CreateFruitReceptionDto): Promise<FruitReception> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

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

      // Si hay material de empaque devuelto, crear movimiento de abono
      if (dto.returnedBoxes && dto.returnedBoxesValue && dto.returnedBoxesValue > 0) {
        // Obtener el saldo actual del productor
        const lastMovement = await queryRunner.manager
          .getRepository(ProducerAccountMovement)
          .findOne({
            where: { producerId: dto.producerId },
            order: { createdAt: 'DESC' },
          })

        const currentBalance = Number(lastMovement?.balance || 0)
        // La devolución reduce la deuda del productor (resta del balance)
        const newBalance = currentBalance - Number(dto.returnedBoxesValue)

        const accountMovement = queryRunner.manager.create(ProducerAccountMovement, {
          producerId: dto.producerId,
          type: 'abono',
          amount: dto.returnedBoxesValue,
          balance: newBalance,
          description: `Devolución de material de empaque - ${dto.returnedBoxes} cajas (Recepción ${reception.code})`,
          referenceType: 'fruit_reception',
          referenceCode: reception.code,
          date: dto.date || new Date().toISOString().split('T')[0],
        })

        await queryRunner.manager.save(accountMovement)
      }

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
      const receptions = await this.fruitReceptionsRepository.find({ where: { id: In(dto.receptionIds) } })

      if (receptions.length !== dto.receptionIds.length) {
        throw new BadRequestException("Some receptions not found")
      }

      const pendingReceptions = receptions.filter((r) => r.shipmentStatus === "pendiente")
      if (pendingReceptions.length !== receptions.length) {
        throw new BadRequestException("All receptions must be pending")
      }

      // Convertir a número explícitamente para evitar concatenación de strings
      const totalBoxes = receptions.reduce((sum, r) => sum + Number(r.boxes), 0)

      // Obtener el trackingFolio de las recepciones (todas deben tener el mismo)
      const trackingFolios = [...new Set(receptions.map(r => r.trackingFolio).filter(Boolean))]
      const trackingFolio = trackingFolios.length > 0 ? trackingFolios[0] : null

      // Solo incluir campos que existen en la entidad Shipment
      const shipment = this.shipmentsRepository.create({
        code: this.generateCode("SH"),
        date: dto.date || new Date().toISOString().split('T')[0],
        trackingFolio,
        totalBoxes: Number(totalBoxes), // Asegurar que sea número
        status: "embarcada",
        carrier: dto.carrier,
        shippedAt: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
        // driver no existe en la entidad, se omite
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

  async updateShipmentStatus(id: string, status: 'embarcada' | 'en-transito' | 'recibida' | 'vendida', salePrice?: number): Promise<Shipment> {
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

            // compute previous balance for this producer
            const lastMovement = await queryRunner.manager.findOne(ProducerAccountMovement, {
              where: { producerId: reception.producerId },
              order: { createdAt: "DESC" },
            })
            const prevBalance = lastMovement ? Number(lastMovement.balance) : 0
            const newBalance = prevBalance + Number(amount)

            const accountMovement = this.accountMovementsRepository.create({
              producerId: reception.producerId,
              type: "abono",
              amount,
              balance: newBalance,
              description: `Venta de embarque - ${shipment.totalBoxes} cajas a $${salePrice}`,
              referenceType: "shipment",
              referenceId: shipment.id,
              referenceCode: shipment.code,
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

    // Use the balance already stored in each movement
    const movementsWithBalance = movements.map((movement) => ({
      ...movement,
      balance: Number(movement.balance),
    }))

    const currentBalance = movements.length > 0 ? Number(movements[movements.length - 1].balance) : 0

    return {
      movements: movementsWithBalance,
      currentBalance,
    }
  }

  // Payments
  async createPayment(dto: CreatePaymentDto): Promise<ProducerAccountMovement> {
    // compute previous balance
    const lastMovement = await this.accountMovementsRepository.findOne({
      where: { producerId: dto.producerId },
      order: { createdAt: "DESC" },
    })
    const prevBalance = lastMovement ? Number(lastMovement.balance) : 0
    const newBalance = prevBalance + Number(dto.amount)

    const payment = this.accountMovementsRepository.create({
      producerId: dto.producerId,
      type: "pago",
      amount: dto.amount,
      balance: newBalance,
      description: `Pago - ${dto.method}`,
      paymentMethod: dto.method,
      paymentReference: dto.reference,
      notes: dto.notes,
    } as any)

    return await this.accountMovementsRepository.save(payment as any)
  }
}
