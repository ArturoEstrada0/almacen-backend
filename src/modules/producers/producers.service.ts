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

      const assignment = this.inputAssignmentsRepository.create({
        code: this.generateCode("IA"),
        producerId: dto.producerId,
        warehouseId: dto.warehouseId,
        date: new Date(),
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
        description: "Asignación de insumos",
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
      try {
        console.error('Error in createInputAssignment:', error)
        if ((error as any)?.stack) console.error((error as any).stack)
      } catch (logErr) {
        console.error('Failed to log createInputAssignment error:', logErr)
      }
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

  // Fruit Receptions
  async createFruitReception(dto: CreateFruitReceptionDto): Promise<FruitReception> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const boxes = Number((dto as any).boxes) || 0
      const weightPerBox = (dto as any).weightPerBox !== undefined ? Number((dto as any).weightPerBox) : undefined
      let totalWeight: number | undefined = (dto as any).totalWeight !== undefined ? Number((dto as any).totalWeight) : undefined

      if (totalWeight === undefined && weightPerBox !== undefined) {
        totalWeight = Number((boxes * weightPerBox).toFixed(2))
      }

      const receptionDate = (dto as any).date ? new Date((dto as any).date) : new Date()

      const reception = this.fruitReceptionsRepository.create({
        code: this.generateCode("FR"),
        producerId: (dto as any).producerId,
        productId: (dto as any).productId,
        warehouseId: (dto as any).warehouseId,
        boxes,
        weightPerBox,
        totalWeight,
        date: receptionDate,
        notes: (dto as any).notes,
        quality: (dto as any).quality,
        shipmentStatus: "pendiente",
      } as any)

      const savedReception = (await queryRunner.manager.save(reception) as unknown) as FruitReception

      // Create inventory movement (entrada)
      await this.inventoryService.createMovement({
        type: MovementType.ENTRADA,
        warehouseId: dto.warehouseId,
        reference: `Recepción de fruta - ${savedReception.id}`,
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
        where: { id: savedReception.id },
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
    try {
      return await this.fruitReceptionsRepository.find({
        relations: ["producer", "product", "warehouse", "shipment"],
        order: { createdAt: "DESC" },
      })
    } catch (error: any) {
      // If joining the shipment relation fails (e.g. DB schema missing column like shipment.total_weight),
      // fall back to loading receptions without the shipment relation so the endpoint doesn't return 500.
      console.error('Error in findAllFruitReceptions:', error)
      const msg = (error?.message || '').toLowerCase()
      if (msg.includes('total_weight') || msg.includes('does not exist') || error?.code === '42703') {
        try {
          console.warn('Falling back to loading fruit receptions without shipment relation')
          return await this.fruitReceptionsRepository.find({
            relations: ["producer", "product", "warehouse"],
            order: { createdAt: "DESC" },
          })
        } catch (err2) {
          console.error('Fallback failed in findAllFruitReceptions:', err2)
          throw new Error(`Failed to fetch fruit receptions (fallback): ${(err2 as any)?.message || err2}`)
        }
      }

      throw new Error(`Failed to fetch fruit receptions: ${(error as any)?.message || error}`)
    }
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

      const totalBoxes = receptions.reduce((sum, r) => sum + r.boxes, 0)

      // compute total weight across receptions: prefer reception.totalWeight, fallback to boxes * weightPerBox
      const totalWeight = receptions.reduce((sum, r) => {
        const rt = (r as any).totalWeight !== undefined && (r as any).totalWeight !== null ? Number((r as any).totalWeight) : undefined
        if (rt !== undefined && !Number.isNaN(rt)) return sum + rt
        const wpb = (r as any).weightPerBox !== undefined && (r as any).weightPerBox !== null ? Number((r as any).weightPerBox) : undefined
        const boxes = (r as any).boxes !== undefined && (r as any).boxes !== null ? Number((r as any).boxes) : 0
        if (wpb !== undefined && !Number.isNaN(wpb)) return sum + boxes * wpb
        return sum
      }, 0)

      const shipmentPayload: any = {
        code: this.generateCode("SH"),
        date: new Date(),
        totalBoxes,
        // include totalWeight when possible, but handle DBs without the column
        totalWeight: Number(totalWeight.toFixed(2)),
        status: "embarcada",
        carrier: dto.carrier,
        shippedAt: new Date(),
        notes: dto.notes,
      }

      let shipment: Shipment
      try {
        shipment = this.shipmentsRepository.create(shipmentPayload) as unknown as Shipment
        await queryRunner.manager.save(shipment)
      } catch (saveErr: any) {
        // If DB schema doesn't have total_weight column, fall back to saving without it
        const msg = (saveErr?.message || "").toLowerCase()
        if (msg.includes('total_weight') || msg.includes('does not exist') || saveErr?.code === '42703') {
          console.warn('Database missing shipments.total_weight, saving shipment without totalWeight column')
          // remove totalWeight and try again
          delete shipmentPayload.totalWeight
          shipment = this.shipmentsRepository.create(shipmentPayload) as unknown as Shipment
          await queryRunner.manager.save(shipment)
          // We'll attach the computed totalWeight to the returned object later
        } else {
          throw saveErr
        }
      }

      for (const reception of receptions) {
        reception.shipmentId = shipment.id
        reception.shipmentStatus = "embarcada"
        await queryRunner.manager.save(reception)
      }

      await queryRunner.commitTransaction()

      const savedShipment = await this.shipmentsRepository.findOne({
        where: { id: shipment.id },
        relations: ["receptions", "receptions.producer", "receptions.product"],
      })

      // If DB schema didn't have total_weight column, attach the calculated value
      if (savedShipment) {
        const hasServerTotal = (savedShipment as any).totalWeight !== undefined && (savedShipment as any).totalWeight !== null
        if (!hasServerTotal) {
          try {
            ;(savedShipment as any).totalWeight = Number(totalWeight.toFixed(2))
          } catch (e) {
            ;(savedShipment as any).totalWeight = totalWeight
          }
        }

        // Normalize numeric fields to JS numbers so frontend checks work
        try {
          if ((savedShipment as any).totalWeight !== undefined && (savedShipment as any).totalWeight !== null) {
            (savedShipment as any).totalWeight = Number((savedShipment as any).totalWeight)
          }
        } catch (e) {
          // leave as-is if conversion fails
        }

        try {
          if ((savedShipment as any).totalBoxes !== undefined && (savedShipment as any).totalBoxes !== null) {
            (savedShipment as any).totalBoxes = Number((savedShipment as any).totalBoxes)
          }
        } catch (e) {}

        if (Array.isArray((savedShipment as any).receptions)) {
          for (const r of (savedShipment as any).receptions) {
            if (!r) continue
            if (r.boxes !== undefined && r.boxes !== null) r.boxes = Number(r.boxes)
            if (r.totalWeight !== undefined && r.totalWeight !== null) r.totalWeight = Number(r.totalWeight)
            // producer relation should already be loaded via relations
          }
        }
      }

      return savedShipment as Shipment
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
    try {
      const raw = await this.shipmentsRepository.find({
        relations: ["receptions", "receptions.producer", "receptions.product"],
        order: { createdAt: "DESC" },
      })

      // Normalize numeric fields for frontend
      const normalized = raw.map((s: any) => {
        try {
          if (s.totalWeight !== undefined && s.totalWeight !== null) s.totalWeight = Number(s.totalWeight)
        } catch (e) {}
        try {
          if (s.totalBoxes !== undefined && s.totalBoxes !== null) s.totalBoxes = Number(s.totalBoxes)
        } catch (e) {}
        if (Array.isArray(s.receptions)) {
          s.receptionIds = s.receptions.map((r: any) => r.id)
          for (const r of s.receptions) {
            if (!r) continue
            if (r.boxes !== undefined && r.boxes !== null) r.boxes = Number(r.boxes)
            if (r.totalWeight !== undefined && r.totalWeight !== null) r.totalWeight = Number(r.totalWeight)
          }
        }
        return s
      })

      return normalized as Shipment[]
    } catch (error: any) {
      console.error('Error in findAllShipments:', error)
      const msg = (error?.message || '').toLowerCase()
      // If the error comes from a missing column like total_weight, fall back to a safe query
      if (msg.includes('total_weight') || msg.includes('does not exist') || error?.code === '42703') {
        try {
          console.warn('Falling back to loading shipments without total_weight column or relations')
          // Select explicit columns that are expected to exist in older schemas (exclude total_weight)
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
            .getRawMany()

          // Map raw rows to partial Shipment entities (keep shape compatible)
          const shipmentsPartial: any[] = rawShipments.map((r: any) => ({
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
          }))

          // Load receptions for these shipments so frontend can compute producers, boxes and weights
          const shipmentIds = shipmentsPartial.map((s) => s.id)
          let receptions: FruitReception[] = []
          try {
            receptions = await this.fruitReceptionsRepository.find({
              where: { shipmentId: In(shipmentIds) },
              relations: ["producer", "product", "warehouse"],
            })
          } catch (receptionErr) {
            console.warn('Could not load receptions during shipments fallback:', receptionErr)
            receptions = []
          }

          // Attach receptions and receptionIds to shipments
          return shipmentsPartial.map((s) => {
            const reps = receptions.filter((r) => r.shipmentId === s.id)
            return {
              ...s,
              receptions: reps,
              receptionIds: reps.map((r) => r.id),
              // compute totalBoxes/totalWeight if missing
              totalBoxes: typeof s.totalBoxes === 'number' && !isNaN(s.totalBoxes)
                ? s.totalBoxes
                : reps.reduce((sum, r) => sum + (Number(r.boxes) || 0), 0),
              totalWeight: reps.reduce((sum, r) => {
                const rt = (r as any).totalWeight !== undefined && (r as any).totalWeight !== null ? Number((r as any).totalWeight) : undefined
                if (rt !== undefined && !Number.isNaN(rt)) return sum + rt
                const wpb = (r as any).weightPerBox !== undefined && (r as any).weightPerBox !== null ? Number((r as any).weightPerBox) : undefined
                const boxes = (r as any).boxes !== undefined && (r as any).boxes !== null ? Number((r as any).boxes) : 0
                if (wpb !== undefined && !Number.isNaN(wpb)) return sum + boxes * wpb
                return sum
              }, 0),
            } as Shipment
          })
        } catch (err2) {
          console.error('Fallback failed in findAllShipments:', err2)
          throw new Error(`Failed to fetch shipments (fallback): ${(err2 as any)?.message || err2}`)
        }
      }

      throw new Error(`Failed to fetch shipments: ${(error as any)?.message || error}`)
    }
  }

  // Account Statements
  async getAccountStatement(producerId: string) {
    const movements = await this.accountMovementsRepository.find({
      where: { producerId },
      order: { createdAt: "ASC" },
    })

    let balance = 0
    const movementsWithBalance = movements.map((movement) => {
      // Ensure numeric arithmetic: TypeORM returns DECIMAL as string in many DB drivers
      const amt = Number(movement.amount) || 0

      if (movement.type === "cargo") {
        balance -= amt
      } else if (movement.type === "abono") {
        balance += amt
      } else if (movement.type === "pago") {
        // A payment reduces the balance (we pay the producer)
        balance -= amt
      }

      return {
        ...movement,
        // normalize amount/balance as numbers to avoid client-side concatenation issues
        amount: amt,
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
    // compute previous balance
    const lastMovement = await this.accountMovementsRepository.findOne({
      where: { producerId: dto.producerId },
      order: { createdAt: "DESC" },
    })
    const prevBalance = lastMovement ? Number(lastMovement.balance) : 0
    const amt = Number(dto.amount) || 0

    // Determine movement type: default to 'pago' if not provided
    const movementType = (dto as any).type || "pago"

    // Compute new balance depending on movement type
    let newBalance = prevBalance
    if (movementType === "abono") {
      newBalance = prevBalance + amt
    } else {
      // 'pago' and 'cargo' (used for devoluciones) decrease balance
      newBalance = prevBalance - amt
    }

    const movement = this.accountMovementsRepository.create({
      producerId: dto.producerId,
      type: movementType,
      amount: amt,
      balance: newBalance,
      description:
        movementType === "abono" ? `Abono` : movementType === "pago" ? `Pago - ${dto.method || ""}` : `Devolución`,
      paymentMethod: dto.method,
      paymentReference: dto.reference,
      notes: dto.notes,
    } as any)

    return await this.accountMovementsRepository.save(movement as any)
  }
}
