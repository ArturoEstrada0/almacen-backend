import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource } from "typeorm"
import { InventoryItem } from "./entities/inventory-item.entity"
import { Movement } from "./entities/movement.entity"
import { MovementItem } from "./entities/movement-item.entity"
import { Warehouse } from "../warehouses/entities/warehouse.entity"
import { type CreateMovementDto, MovementType } from "./dto/create-movement.dto"

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(Movement)
    private movementsRepository: Repository<Movement>,
    @InjectRepository(MovementItem)
    private movementItemsRepository: Repository<MovementItem>,
    private dataSource: DataSource,
  ) {}

  async getInventory(warehouseId?: string) {
    const where = warehouseId ? { warehouseId } : {}
    return await this.inventoryRepository.find({
      where,
      relations: ["product", "warehouse"],
      order: { product: { name: "ASC" } },
    })
  }

  async getInventoryByProduct(productId: string) {
    return await this.inventoryRepository.find({
      where: { productId },
      relations: ["warehouse"],
    })
  }

  async getLowStockProducts(warehouseId?: string) {
    const qb = this.inventoryRepository
      .createQueryBuilder("inventory")
      .leftJoinAndSelect("inventory.product", "product")
      .leftJoinAndSelect("inventory.warehouse", "warehouse")
      .where("inventory.quantity <= COALESCE(inventory.reorderPoint, inventory.minStock, 0)");

    if (warehouseId) {
      qb.andWhere("inventory.warehouseId = :warehouseId", { warehouseId });
    }

    return await qb.getMany();
  }

  async createMovement(createMovementDto: CreateMovementDto): Promise<Movement> {
    // Basic validations for transfers
    if (createMovementDto.type === MovementType.TRASPASO) {
      if (!createMovementDto.destinationWarehouseId) {
        throw new BadRequestException("destinationWarehouseId is required for traspaso")
      }
      if (createMovementDto.destinationWarehouseId === createMovementDto.warehouseId) {
        throw new BadRequestException("Source and destination warehouse must be different for traspaso")
      }

      // Verify both warehouses exist and are active
      const [src, dest] = await Promise.all([
        this.warehouseRepository.findOne({ where: { id: createMovementDto.warehouseId } }),
        this.warehouseRepository.findOne({ where: { id: createMovementDto.destinationWarehouseId } }),
      ])

      if (!src) throw new BadRequestException(`Source warehouse ${createMovementDto.warehouseId} not found`)
      if (!dest) throw new BadRequestException(`Destination warehouse ${createMovementDto.destinationWarehouseId} not found`)

      if (!src.active) throw new BadRequestException(`Source warehouse ${createMovementDto.warehouseId} is not active`)
      if (!dest.active) throw new BadRequestException(`Destination warehouse ${createMovementDto.destinationWarehouseId} is not active`)

      // Pre-check stock for each item to provide early feedback (avoids creating a movement that will rollback)
      for (const itemDto of createMovementDto.items) {
        const whereClause: any = { warehouseId: createMovementDto.warehouseId, productId: itemDto.productId }
        if (itemDto.locationId) whereClause.locationCode = itemDto.locationId
        const inv = await this.inventoryRepository.findOne({ where: whereClause })
        const available = inv ? Number(inv.quantity) : 0
        if (available < Number(itemDto.quantity)) {
          throw new BadRequestException(`Insufficient stock in source warehouse for product ${itemDto.productId}`)
        }
      }
    }
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
        // Create movement - generate a simple unique code to satisfy DB unique constraint
        const createdMovement = this.movementsRepository.create({
          code: `MV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type: createMovementDto.type,
          warehouseId: createMovementDto.warehouseId,
          destinationWarehouseId: createMovementDto.destinationWarehouseId,
          // map optional fields if present
          referenceType: (createMovementDto as any).referenceType || undefined,
          referenceId: (createMovementDto as any).referenceId || undefined,
          notes: createMovementDto.notes,
        } as any)
      await queryRunner.manager.save(createdMovement)

      // Process each item
      for (const itemDto of createMovementDto.items) {
        // Create movement item
          const movementItem = this.movementItemsRepository.create({
            movementId: (createdMovement as any).id,
            productId: itemDto.productId,
            quantity: itemDto.quantity,
            locationId: itemDto.locationId,
            notes: itemDto.notes,
          } as any)
        await queryRunner.manager.save(movementItem)

        // Update inventory based on movement type
        await this.updateInventory(
          queryRunner,
          createMovementDto.type,
          createMovementDto.warehouseId,
          itemDto.productId,
          itemDto.quantity,
          itemDto.locationId,
          createMovementDto.destinationWarehouseId,
        )
      }

      await queryRunner.commitTransaction()

      // Return movement with relations
        return await this.movementsRepository.findOne({
        where: { id: (createdMovement as any).id },
        relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  private async updateInventory(
    queryRunner: any,
    type: MovementType,
    warehouseId: string,
    productId: string,
    quantity: number,
    locationId?: string,
    destinationWarehouseId?: string,
  ) {
    // Find or create inventory item
    const whereClause: any = { warehouseId, productId }
    // InventoryItem entity stores a `locationCode` column (string). If a locationId is provided
    // we will store it in `locationCode` and try to match by it; otherwise ignore location filtering.
    if (locationId) {
      whereClause.locationCode = locationId
    }

    let inventoryItem = await queryRunner.manager.findOne(InventoryItem, {
      where: whereClause,
    })

    if (!inventoryItem) {
      inventoryItem = queryRunner.manager.create(InventoryItem, {
        warehouseId,
        productId,
        // keep location info in locationCode column
        locationCode: locationId || null,
        quantity: 0,
        minStock: 0,
        maxStock: 1000,
      })
    }

    // Update stock based on movement type
    // Helper to coerce decimal (string) values returned by TypeORM to numbers
    const toNumber = (v: any) => {
      const n = Number(v)
      return Number.isNaN(n) ? 0 : n
    }

    switch (type) {
      case MovementType.ENTRADA:
        // increase quantity on entrada
        inventoryItem.quantity = toNumber(inventoryItem.quantity) + Number(quantity)
        break
      case MovementType.SALIDA:
        if (toNumber(inventoryItem.quantity) < Number(quantity)) {
          throw new BadRequestException("Insufficient stock")
        }
        inventoryItem.quantity = toNumber(inventoryItem.quantity) - Number(quantity)
        break
      case MovementType.AJUSTE:
        // ajuste sets absolute quantity
        inventoryItem.quantity = Number(quantity)
        break
      case MovementType.TRASPASO:
        // Decrease from source warehouse
        if (toNumber(inventoryItem.quantity) < Number(quantity)) {
          throw new BadRequestException("Insufficient stock for transfer")
        }
        inventoryItem.quantity = toNumber(inventoryItem.quantity) - Number(quantity)

        // Increase in destination warehouse
        if (destinationWarehouseId) {
          let destInventory = await queryRunner.manager.findOne(InventoryItem, {
            where: { warehouseId: destinationWarehouseId, productId },
          })

          if (!destInventory) {
            destInventory = queryRunner.manager.create(InventoryItem, {
              warehouseId: destinationWarehouseId,
              productId,
              quantity: 0,
              minStock: 0,
              maxStock: 1000,
            })
          }

          destInventory.quantity = toNumber(destInventory.quantity) + Number(quantity)
          await queryRunner.manager.save(destInventory)
        }
        break
    }

    await queryRunner.manager.save(inventoryItem)
  }

  async getMovements(warehouseId?: string) {
    const where = warehouseId ? { warehouseId } : {}
    return await this.movementsRepository.find({
      where,
      relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
      order: { createdAt: "DESC" },
    })
  }

  async getMovement(id: string) {
    const movement = await this.movementsRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
    })

    if (!movement) {
      throw new NotFoundException(`Movement with ID ${id} not found`)
    }

    return movement
  }

  async updateInventorySettings(productId: string, body: { 
    warehouseId: string
    quantity?: number
    minStock?: number
    maxStock?: number
    reorderPoint?: number
    locationId?: string
    lotNumber?: string
    expirationDate?: Date | string
  }) {
    const { warehouseId, quantity, minStock, maxStock, reorderPoint, locationId, lotNumber, expirationDate } = body

    const where: any = { productId }
    if (warehouseId) where.warehouseId = warehouseId

    let inventoryItem = await this.inventoryRepository.findOne({ where })

    if (!inventoryItem) {
      // Create a new inventory item with provided settings
      // TS: some type mismatches from TypeORM definitions cause the inferred return
      // type to be an array in our environment; cast to `InventoryItem` to satisfy TS.
      inventoryItem = (this.inventoryRepository.create({
        productId,
        warehouseId,
        locationCode: locationId || null,
        quantity: quantity ?? 0,
        minStock: minStock ?? 0,
        maxStock: maxStock ?? 0,
        reorderPoint: reorderPoint ?? 0,
        lotNumber: lotNumber || null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      } as any) as unknown) as InventoryItem
    } else {
      if (quantity !== undefined) inventoryItem.quantity = quantity
      if (minStock !== undefined) inventoryItem.minStock = minStock
      if (maxStock !== undefined) inventoryItem.maxStock = maxStock
      if (reorderPoint !== undefined) inventoryItem.reorderPoint = reorderPoint
      if (locationId !== undefined) inventoryItem.locationCode = locationId
      if (lotNumber !== undefined) inventoryItem.lotNumber = lotNumber
      if (expirationDate !== undefined) inventoryItem.expirationDate = expirationDate ? new Date(expirationDate) : null
    }

    return await this.inventoryRepository.save(inventoryItem)
  }
}
