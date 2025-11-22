import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource, In } from "typeorm"
import { Producer } from "./entities/producer.entity"
import { InputAssignment } from "./entities/input-assignment.entity"
import { InputAssignmentItem } from "./entities/input-assignment-item.entity"
import { FruitReception } from "./entities/fruit-reception.entity"
import { ReturnedItem } from "./entities/returned-item.entity"
import { Shipment } from "./entities/shipment.entity"
import { ProducerAccountMovement } from "./entities/producer-account-movement.entity"
import { PaymentReport } from "./entities/payment-report.entity"
import { PaymentReportItem } from "./entities/payment-report-item.entity"
import type { CreateProducerDto } from "./dto/create-producer.dto"
import type { CreateInputAssignmentDto } from "./dto/create-input-assignment.dto"
import type { CreateFruitReceptionDto } from "./dto/create-fruit-reception.dto"
import type { CreateShipmentDto } from "./dto/create-shipment.dto"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import type { CreatePaymentReportDto, UpdatePaymentReportStatusDto } from "./dto/create-payment-report.dto"
import { InventoryService } from "../inventory/inventory.service"
import { MovementType } from "../inventory/dto/create-movement.dto"
import { Product } from "../products/entities/product.entity"

@Injectable()
export class ProducersService {
  private producersRepository: Repository<Producer>
  private inputAssignmentsRepository: Repository<InputAssignment>
  private inputAssignmentItemsRepository: Repository<InputAssignmentItem>
  private fruitReceptionsRepository: Repository<FruitReception>
  private returnedItemsRepository: Repository<ReturnedItem>
  private shipmentsRepository: Repository<Shipment>
  private accountMovementsRepository: Repository<ProducerAccountMovement>
  private paymentReportsRepository: Repository<PaymentReport>
  private paymentReportItemsRepository: Repository<PaymentReportItem>
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
    @InjectRepository(ReturnedItem)
    returnedItemsRepository: Repository<ReturnedItem>,
    @InjectRepository(Shipment)
    shipmentsRepository: Repository<Shipment>,
    @InjectRepository(ProducerAccountMovement)
    accountMovementsRepository: Repository<ProducerAccountMovement>,
    @InjectRepository(PaymentReport)
    paymentReportsRepository: Repository<PaymentReport>,
    @InjectRepository(PaymentReportItem)
    paymentReportItemsRepository: Repository<PaymentReportItem>,
    inventoryService: InventoryService,
    dataSource: DataSource,
  ) {
    this.producersRepository = producersRepository
    this.inputAssignmentsRepository = inputAssignmentsRepository
    this.inputAssignmentItemsRepository = inputAssignmentItemsRepository
    this.fruitReceptionsRepository = fruitReceptionsRepository
    this.returnedItemsRepository = returnedItemsRepository
    this.shipmentsRepository = shipmentsRepository
    this.accountMovementsRepository = accountMovementsRepository
    this.paymentReportsRepository = paymentReportsRepository
    this.paymentReportItemsRepository = paymentReportItemsRepository
    this.inventoryService = inventoryService
    this.dataSource = dataSource
  }

  private generateCode(prefix: string) {
    return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 9000) + 1000}`
  }

  private async generateTrackingFolio(): Promise<string> {
    // Formato: DDMMAA-NNN (día, mes, año de 2 dígitos + número secuencial)
    const now = new Date()
    const day = now.getDate().toString().padStart(2, '0')
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear().toString().slice(-2)
    const datePrefix = `${day}${month}${year}`
    
    // Buscar el último folio del día en todas las tablas que usan trackingFolio
    const assignments = await this.inputAssignmentsRepository
      .createQueryBuilder('assignment')
      .where('assignment.trackingFolio LIKE :prefix', { prefix: `${datePrefix}-%` })
      .orderBy('assignment.trackingFolio', 'DESC')
      .getOne()
    
    const receptions = await this.fruitReceptionsRepository
      .createQueryBuilder('reception')
      .where('reception.trackingFolio LIKE :prefix', { prefix: `${datePrefix}-%` })
      .orderBy('reception.trackingFolio', 'DESC')
      .getOne()
    
    const shipments = await this.shipmentsRepository
      .createQueryBuilder('shipment')
      .where('shipment.trackingFolio LIKE :prefix', { prefix: `${datePrefix}-%` })
      .orderBy('shipment.trackingFolio', 'DESC')
      .getOne()
    
    // Obtener todos los folios del día y encontrar el número más alto
    const allFolios = [
      assignments?.trackingFolio,
      receptions?.trackingFolio,
      shipments?.trackingFolio
    ].filter(Boolean)
    
    let nextNumber = 1
    if (allFolios.length > 0) {
      const numbers = allFolios.map(folio => {
        const parts = folio.split('-')
        return parts.length > 1 ? parseInt(parts[1], 10) : 0
      }).filter(num => !isNaN(num))
      
      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1
      }
    }
    
    return `${datePrefix}-${nextNumber.toString().padStart(3, '0')}`
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

      const trackingFolio = dto.trackingFolio || await this.generateTrackingFolio()

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

      // Guardar items devueltos si existen
      if (dto.returnedItems && dto.returnedItems.length > 0) {
        for (const itemDto of dto.returnedItems) {
          const total = Number(itemDto.quantity) * Number(itemDto.unitPrice)
          const returnedItem = queryRunner.manager.create(ReturnedItem, {
            receptionId: reception.id,
            productId: itemDto.productId,
            quantity: itemDto.quantity,
            unitPrice: itemDto.unitPrice,
            total,
          })
          await queryRunner.manager.save(returnedItem)
        }
      }

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

      // Si hay items devueltos o valor de devolución, crear movimiento de abono
      const returnedValue = dto.returnedBoxesValue || 0
      if (returnedValue > 0) {
        // Obtener el saldo actual del productor
        const lastMovement = await queryRunner.manager
          .getRepository(ProducerAccountMovement)
          .findOne({
            where: { producerId: dto.producerId },
            order: { createdAt: 'DESC' },
          })

        const currentBalance = Number(lastMovement?.balance || 0)
        const newBalance = currentBalance + Number(returnedValue)

        let description = `Devolución de material/insumos`
        if (dto.returnedItems && dto.returnedItems.length > 0) {
          // Obtener nombres de productos devueltos
          const productNames = await Promise.all(
            dto.returnedItems.slice(0, 2).map(async (item) => {
              const product = await queryRunner.manager.findOne(Product, {
                where: { id: item.productId },
              })
              return product?.name || product?.sku || 'Producto'
            })
          )
          const remaining = dto.returnedItems.length - 2
          description += `: ${productNames.join(', ')}${remaining > 0 ? ` y ${remaining} más` : ''}`
        } else if (dto.returnedBoxes) {
          description += ` - ${dto.returnedBoxes} cajas`
        }
        description += ` (Recepción ${reception.code})`

        const accountMovement = queryRunner.manager.create(ProducerAccountMovement, {
          producerId: dto.producerId,
          type: 'abono',
          amount: returnedValue,
          balance: newBalance,
          description,
          referenceType: 'fruit_reception',
          referenceCode: reception.code,
          date: dto.date || new Date().toISOString().split('T')[0],
        })

        await queryRunner.manager.save(accountMovement)
      }

      await queryRunner.commitTransaction()

      return await this.fruitReceptionsRepository.findOne({
        where: { id: reception.id },
        relations: ["producer", "product", "warehouse", "returnedItems", "returnedItems.product"],
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
      relations: ["producer", "product", "warehouse", "shipment", "returnedItems", "returnedItems.product"],
      order: { createdAt: "DESC" },
    })
  }

  async updateFruitReception(id: string, dto: CreateFruitReceptionDto): Promise<FruitReception> {
    const reception = await this.fruitReceptionsRepository.findOne({ 
      where: { id },
      relations: ["returnedItems"]
    })
    if (!reception) {
      throw new NotFoundException(`Fruit reception with ID ${id} not found`)
    }

    // No permitir editar si ya está embarcada o vendida
    if (reception.shipmentStatus !== 'pendiente') {
      throw new BadRequestException('Cannot edit reception that is already shipped or sold')
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Eliminar items devueltos existentes
      if (reception.returnedItems && reception.returnedItems.length > 0) {
        await queryRunner.manager.delete(ReturnedItem, { receptionId: id })
      }

      // Actualizar la recepción
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
      })

      await queryRunner.manager.save(reception)

      // Guardar nuevos items devueltos
      if (dto.returnedItems && dto.returnedItems.length > 0) {
        for (const itemDto of dto.returnedItems) {
          const total = Number(itemDto.quantity) * Number(itemDto.unitPrice)
          const returnedItem = queryRunner.manager.create(ReturnedItem, {
            receptionId: reception.id,
            productId: itemDto.productId,
            quantity: itemDto.quantity,
            unitPrice: itemDto.unitPrice,
            total,
          })
          await queryRunner.manager.save(returnedItem)
        }
      }

      await queryRunner.commitTransaction()

      return await this.fruitReceptionsRepository.findOne({
        where: { id },
        relations: ["producer", "product", "warehouse", "returnedItems", "returnedItems.product"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async deleteFruitReception(id: string): Promise<void> {
    const reception = await this.fruitReceptionsRepository.findOne({ where: { id } })
    if (!reception) {
      throw new NotFoundException(`Fruit reception with ID ${id} not found`)
    }

    // No permitir eliminar si ya está embarcada o vendida
    if (reception.shipmentStatus !== 'pendiente') {
      throw new BadRequestException('Cannot delete reception that is already shipped or sold')
    }

    await this.fruitReceptionsRepository.remove(reception)
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
        carrierContact: dto.driver,
        shippedAt: dto.date ? new Date(dto.date) : new Date(),
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

  async updateShipment(id: string, dto: Partial<CreateShipmentDto>): Promise<Shipment> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const shipment = await this.shipmentsRepository.findOne({ 
        where: { id },
        relations: ["receptions"]
      })
      
      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`)
      }

      // No permitir editar si ya está vendido
      if (shipment.status === 'vendida') {
        throw new BadRequestException('Cannot edit shipment that is already sold')
      }

      // Si se proporcionan nuevos receptionIds, actualizar las recepciones
      if (dto.receptionIds && Array.isArray(dto.receptionIds)) {
        // Obtener IDs actuales
        const currentReceptionIds = shipment.receptions.map(r => r.id)
        
        // Recepciones a remover (estaban en el embarque pero ya no están seleccionadas)
        const receptionsToRemove = currentReceptionIds.filter(id => !dto.receptionIds.includes(id))
        
        // Recepciones a agregar (están seleccionadas pero no estaban en el embarque)
        const receptionsToAdd = dto.receptionIds.filter(id => !currentReceptionIds.includes(id))
        
        // Remover recepciones del embarque (vuelven a pendiente)
        for (const receptionId of receptionsToRemove) {
          const reception = await queryRunner.manager.findOne(FruitReception, { where: { id: receptionId } })
          if (reception) {
            reception.shipmentId = null
            reception.shipmentStatus = 'pendiente'
            await queryRunner.manager.save(reception)
          }
        }
        
        // Agregar nuevas recepciones al embarque
        for (const receptionId of receptionsToAdd) {
          const reception = await queryRunner.manager.findOne(FruitReception, { where: { id: receptionId } })
          if (reception) {
            // Verificar que esté pendiente
            if (reception.shipmentStatus !== 'pendiente') {
              throw new BadRequestException(`Reception ${reception.code} is not available for shipment`)
            }
            reception.shipmentId = shipment.id
            reception.shipmentStatus = 'embarcada'
            await queryRunner.manager.save(reception)
          }
        }
        
        // Recalcular totalBoxes
        const allReceptions = await queryRunner.manager.find(FruitReception, { 
          where: { shipmentId: id } 
        })
        shipment.totalBoxes = allReceptions.reduce((sum, r) => sum + Number(r.boxes || 0), 0)
      }

      // Actualizar campos básicos
      if (dto.carrier) shipment.carrier = dto.carrier
      if (dto.driver !== undefined) shipment.carrierContact = dto.driver
      if (dto.date) shipment.date = dto.date
      if (dto.notes !== undefined) shipment.notes = dto.notes

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

  async deleteShipment(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const shipment = await this.shipmentsRepository.findOne({ 
        where: { id },
        relations: ["receptions"]
      })
      
      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`)
      }

      // No permitir eliminar si ya está vendido
      if (shipment.status === 'vendida') {
        throw new BadRequestException('Cannot delete shipment that is already sold')
      }

      // Revertir el estado de las recepciones a pendiente
      for (const reception of shipment.receptions) {
        reception.shipmentId = null
        reception.shipmentStatus = 'pendiente'
        await queryRunner.manager.save(reception)
      }

      // Eliminar el embarque
      await queryRunner.manager.remove(shipment)
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
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
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // compute previous balance
      const lastMovement = await queryRunner.manager.findOne(ProducerAccountMovement, {
        where: { producerId: dto.producerId },
        order: { createdAt: "DESC" },
      })
      const prevBalance = lastMovement ? Number(lastMovement.balance) : 0

      // Si hay movimientos seleccionados, agregar en la descripción
      let description = `Pago - ${dto.method}`
      if (dto.selectedMovements && dto.selectedMovements.length > 0) {
        const movements = await queryRunner.manager.find(ProducerAccountMovement, {
          where: { id: In(dto.selectedMovements) }
        })
        const refs = movements.map(m => m.referenceCode).filter(Boolean).slice(0, 3).join(", ")
        if (refs) {
          description += ` - Cubre: ${refs}${dto.selectedMovements.length > 3 ? ` y ${dto.selectedMovements.length - 3} más` : ""}`
        }
      }

      // Registrar el pago
      // Un pago reduce lo que le debemos al productor
      let newBalance = prevBalance - Number(dto.amount)
      const payment = queryRunner.manager.create(ProducerAccountMovement, {
        producerId: dto.producerId,
        type: "pago",
        amount: dto.amount,
        balance: newBalance,
        description: description,
        paymentMethod: dto.method,
        paymentReference: dto.reference,
        notes: dto.notes,
      } as any)
      await queryRunner.manager.save(payment)

      // Si hay retención, registrar como cargo (reduce lo que le debemos al productor)
      // La retención es un descuento que aplicamos, entonces reduce el saldo a favor del productor
      if (dto.retention && dto.retention.amount > 0) {
        newBalance = newBalance - Number(dto.retention.amount)  // RESTAR la retención
        const retention = queryRunner.manager.create(ProducerAccountMovement, {
          producerId: dto.producerId,
          type: "cargo",
          amount: dto.retention.amount,
          balance: newBalance,
          description: `Retención - ${dto.retention.notes || "Descuento aplicado"}`,
          notes: dto.retention.notes,
        } as any)
        await queryRunner.manager.save(retention)
      }

      // Crear Reporte de Pago automáticamente
      // Solo si hay movimientos seleccionados que sean recepciones de fruta
      console.log('=== PAYMENT REPORT DEBUG ===')
      console.log('selectedMovements:', dto.selectedMovements)
      console.log('selectedMovements length:', dto.selectedMovements?.length)
      
      if (dto.selectedMovements && dto.selectedMovements.length > 0) {
        // Obtener los movimientos seleccionados para verificar si son ventas de embarques
        const movements = await queryRunner.manager.find(ProducerAccountMovement, {
          where: { id: In(dto.selectedMovements) }
        })
        
        console.log('movements found:', movements.length)
        console.log('movements:', movements.map(m => ({ id: m.id, type: m.type, refType: m.referenceType, refId: m.referenceId })))
        
        // Filtrar solo los movimientos que son ventas de embarques
        const shipmentMovements = movements.filter(m => 
          m.referenceType === 'shipment' && m.referenceId && m.type === 'abono'
        )

        console.log('shipmentMovements:', shipmentMovements.length)

        if (shipmentMovements.length > 0) {
          // Obtener los embarques
          const shipmentIds = shipmentMovements.map(m => m.referenceId)
          const shipments = await queryRunner.manager.find(Shipment, {
            where: { id: In(shipmentIds) },
            relations: ['receptions']
          })

          // Obtener todas las recepciones de fruta de esos embarques del productor actual
          const allReceptionIds: string[] = []
          for (const shipment of shipments) {
            const receptionIds = shipment.receptions
              .filter(r => r.producerId === dto.producerId)
              .map(r => r.id)
            allReceptionIds.push(...receptionIds)
          }

          if (allReceptionIds.length > 0) {
            const fruitReceptions = await queryRunner.manager.find(FruitReception, {
              where: { id: In(allReceptionIds) },
              relations: ['product']  // Cargar la relación con producto
            })

            console.log('fruitReceptions found:', fruitReceptions.length)

            // Calcular subtotal de las recepciones
            const subtotal = fruitReceptions.reduce((sum, reception) => 
              sum + (reception.boxes * reception.pricePerBox), 0
            )
            
            const retentionAmount = dto.retention?.amount || 0
            const totalToPay = subtotal - retentionAmount  // Calcular correctamente: subtotal - retención

            console.log('Creating payment report:', { subtotal, retentionAmount, totalToPay })

            // Crear el reporte de pago
            const paymentReport = queryRunner.manager.create(PaymentReport, {
              code: this.generateCode("PR"),
              producerId: dto.producerId,
              date: new Date().toISOString().split('T')[0],
              subtotal: Number(subtotal.toFixed(2)),
              retentionAmount: Number(retentionAmount.toFixed(2)),
              retentionNotes: dto.retention?.notes,
              totalToPay: Number(totalToPay.toFixed(2)),
              status: "pagado", // Ya se pagó
              notes: dto.notes,
              paymentMethod: dto.method,
              paidAt: new Date(),
            })
            await queryRunner.manager.save(paymentReport)

            console.log('Payment report created:', paymentReport.id)

            // Crear los items del reporte
            for (const reception of fruitReceptions) {
              const item = queryRunner.manager.create(PaymentReportItem, {
                paymentReportId: paymentReport.id,
                fruitReceptionId: reception.id,
                boxes: reception.boxes,
                pricePerBox: reception.pricePerBox,
                subtotal: reception.boxes * reception.pricePerBox,
              })
              await queryRunner.manager.save(item)
            }
            
            console.log('Payment report items created:', fruitReceptions.length)
          }
        }
      }

      await queryRunner.commitTransaction()
      return payment
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Payment Reports
  async createPaymentReport(dto: CreatePaymentReportDto): Promise<PaymentReport> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Calcular subtotal
      const subtotal = dto.items.reduce((sum, item) => sum + (item.boxes * item.pricePerBox), 0)
      const retentionAmount = dto.retentionAmount || 0
      const totalToPay = subtotal - retentionAmount

      // Crear reporte de pago
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
      })
      await queryRunner.manager.save(paymentReport)

      // Crear items del reporte
      for (const itemDto of dto.items) {
        const item = this.paymentReportItemsRepository.create({
          paymentReportId: paymentReport.id,
          fruitReceptionId: itemDto.fruitReceptionId,
          boxes: itemDto.boxes,
          pricePerBox: itemDto.pricePerBox,
          subtotal: Number((itemDto.boxes * itemDto.pricePerBox).toFixed(2)),
        })
        await queryRunner.manager.save(item)
      }

      await queryRunner.commitTransaction()

      return await this.paymentReportsRepository.findOne({
        where: { id: paymentReport.id },
        relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAllPaymentReports(): Promise<PaymentReport[]> {
    return await this.paymentReportsRepository.find({
      relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
      order: { createdAt: "DESC" },
    })
  }

  async findOnePaymentReport(id: string): Promise<PaymentReport> {
    const report = await this.paymentReportsRepository.findOne({
      where: { id },
      relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
    })

    if (!report) {
      throw new NotFoundException(`Payment report with ID ${id} not found`)
    }

    return report
  }

  async updatePaymentReport(id: string, dto: CreatePaymentReportDto): Promise<PaymentReport> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const report = await this.paymentReportsRepository.findOne({ 
        where: { id },
        relations: ["items"]
      })
      
      if (!report) {
        throw new NotFoundException(`Payment report with ID ${id} not found`)
      }

      // No permitir editar si ya está pagado
      if (report.status === 'pagado') {
        throw new BadRequestException('Cannot edit payment report that is already paid')
      }

      // Eliminar items existentes
      await queryRunner.manager.delete(PaymentReportItem, { paymentReportId: id })

      // Recalcular totales
      const subtotal = dto.items.reduce((sum, item) => sum + (item.boxes * item.pricePerBox), 0)
      const retentionAmount = dto.retentionAmount || 0
      const totalToPay = subtotal - retentionAmount

      // Actualizar reporte
      report.producerId = dto.producerId
      report.date = dto.date || report.date
      report.subtotal = Number(subtotal.toFixed(2))
      report.retentionAmount = Number(retentionAmount.toFixed(2))
      report.retentionNotes = dto.retentionNotes
      report.totalToPay = Number(totalToPay.toFixed(2))
      report.notes = dto.notes
      
      await queryRunner.manager.save(report)

      // Crear nuevos items
      for (const itemDto of dto.items) {
        const item = this.paymentReportItemsRepository.create({
          paymentReportId: report.id,
          fruitReceptionId: itemDto.fruitReceptionId,
          boxes: itemDto.boxes,
          pricePerBox: itemDto.pricePerBox,
          subtotal: Number((itemDto.boxes * itemDto.pricePerBox).toFixed(2)),
        })
        await queryRunner.manager.save(item)
      }

      await queryRunner.commitTransaction()

      return await this.paymentReportsRepository.findOne({
        where: { id },
        relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async updatePaymentReportStatus(id: string, dto: UpdatePaymentReportStatusDto): Promise<PaymentReport> {
    const report = await this.paymentReportsRepository.findOne({ where: { id } })
    
    if (!report) {
      throw new NotFoundException(`Payment report with ID ${id} not found`)
    }

    report.status = dto.status
    if (dto.paymentMethod) report.paymentMethod = dto.paymentMethod
    if (dto.notes) report.notes = dto.notes
    if (dto.status === 'pagado') report.paidAt = new Date()

    await this.paymentReportsRepository.save(report)

    return await this.paymentReportsRepository.findOne({
      where: { id },
      relations: ["producer", "items", "items.fruitReception", "items.fruitReception.product"],
    })
  }

  async deletePaymentReport(id: string): Promise<void> {
    const report = await this.paymentReportsRepository.findOne({ where: { id } })
    
    if (!report) {
      throw new NotFoundException(`Payment report with ID ${id} not found`)
    }

    // No permitir eliminar si ya está pagado
    if (report.status === 'pagado') {
      throw new BadRequestException('Cannot delete payment report that is already paid')
    }

    await this.paymentReportsRepository.remove(report)
  }
}

