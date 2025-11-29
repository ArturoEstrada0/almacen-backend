import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource } from "typeorm"
import { PurchaseOrder } from "./entities/purchase-order.entity"
import { PurchaseOrderItem } from "./entities/purchase-order-item.entity"
import { type CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto"
import { type RegisterPaymentDto } from "./dto/register-payment.dto"
import { InventoryService } from "../inventory/inventory.service"
import { MovementType } from "../inventory/dto/create-movement.dto"

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name)
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemsRepository: Repository<PurchaseOrderItem>,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Calculate total
      const total = createPurchaseOrderDto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

      // Ensure required fields and defaults
      const generatedCode = (createPurchaseOrderDto as any).orderNumber || `OC-${Date.now()}`
      const orderDate = new Date()
      
      // Calculate due date based on credit days
      const creditDays = createPurchaseOrderDto.creditDays || 0
      const dueDate = new Date(orderDate)
      dueDate.setDate(dueDate.getDate() + creditDays)

      // Create purchase order (exclude items to avoid cascade inserting incomplete item objects)
      const { items: dtoItems, ...purchaseOrderFields } = createPurchaseOrderDto as any

      const purchaseOrder = this.purchaseOrdersRepository.create({
        ...purchaseOrderFields,
        code: generatedCode,
        date: orderDate,
        status: "pendiente",
        total,
        paymentTerms: creditDays,
        dueDate,
      } as any)

      await queryRunner.manager.save(purchaseOrder as any)

      // Log full payload for debugging (will help trace unexpected shapes)
      this.logger.log(
        `Creating purchase order with payload: ${JSON.stringify({
          supplierId: createPurchaseOrderDto.supplierId,
          warehouseId: createPurchaseOrderDto.warehouseId,
          items: createPurchaseOrderDto.items,
        })}`,
      )

  // Validate items & Create items (use the original dto items array)
  for (const itemDto of (dtoItems || [])) {
        // Accept several possible field names and coerce to number
        const rawPrice = (itemDto as any).unitPrice ?? (itemDto as any).price ?? (itemDto as any).unit_price
        const price = Number(rawPrice)

        if (!Number.isFinite(price)) {
          this.logger.error(`Invalid item payload when creating purchase order (price missing or not numeric): ${JSON.stringify(itemDto)}`)
          throw new BadRequestException(`Missing or invalid price for product ${itemDto?.productId}`)
        }

        const qty = Number(itemDto.quantity)
        if (!Number.isFinite(qty) || qty <= 0) {
          this.logger.error(`Invalid item payload when creating purchase order (quantity missing or invalid): ${JSON.stringify(itemDto)}`)
          throw new BadRequestException(`Missing or invalid quantity for product ${itemDto?.productId}`)
        }

        // Build a plain object and insert explicitly. Using strings for DECIMAL
        // fields avoids precision/parameterization issues with some drivers.
        const plainItem = {
          purchaseOrderId: (purchaseOrder as any).id,
          productId: itemDto.productId,
          quantity: qty,
          receivedQuantity: 0,
          // Store as strings with 2 decimals to match DECIMAL columns
          price: price.toFixed(2),
          total: (qty * price).toFixed(2),
          notes: itemDto.notes,
        } as any

        // Extra debug logging to capture the exact payload sent to the DB
        try {
          this.logger.log(`Saving purchase order item (plain): ${JSON.stringify(plainItem)}`)
        } catch (e) {
          this.logger.log(`Saving purchase order item (plain): ${String(plainItem)}`)
        }

        // Use a raw query to force the DB to receive the exact values (avoid ORM parameter mapping issues)
        try {
          await queryRunner.query(
            `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, received_quantity, price, total, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [plainItem.purchaseOrderId, plainItem.productId, plainItem.quantity, plainItem.receivedQuantity, plainItem.price, plainItem.total, plainItem.notes],
          )
        } catch (err) {
          this.logger.error(`Failed raw insert for purchase order item: ${JSON.stringify(plainItem)} - ${err}`)
          throw err
        }
      }

      await queryRunner.commitTransaction()

  return await this.findOne((purchaseOrder as any).id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Load the PurchaseOrder entity (used internally for DB updates)
  private async loadEntity(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrdersRepository.findOne({
      where: { id },
      relations: ["supplier", "warehouse", "items", "items.product"],
    })

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`)
    }

    return purchaseOrder
  }

  // Map entity -> API shape expected by frontend
  private mapPurchaseOrder(purchaseOrder: PurchaseOrder): any {
    const po: any = { ...purchaseOrder } as any

    // Backwards-compatible aliases expected by the frontend
    po.orderNumber = (purchaseOrder as any).code
    po.orderDate = (purchaseOrder as any).date
    po.expectedDeliveryDate = (purchaseOrder as any).expectedDate ?? null
    po.paymentStatus = (purchaseOrder as any).paymentStatus || "pendiente"
    po.amountPaid = (purchaseOrder as any).amountPaid !== undefined ? Number((purchaseOrder as any).amountPaid) : 0
    po.creditDays = (purchaseOrder as any).paymentTerms || 0
    
    // Convertir campos decimales a números
    po.total = (purchaseOrder as any).total !== undefined ? Number((purchaseOrder as any).total) : 0
    po.subtotal = (purchaseOrder as any).subtotal !== undefined ? Number((purchaseOrder as any).subtotal) : 0
    po.tax = (purchaseOrder as any).tax !== undefined ? Number((purchaseOrder as any).tax) : 0

    // Map item fields (provide unitPrice alongside DB 'price' string)
    po.items = (purchaseOrder.items || []).map((it: any) => ({
      ...it,
      unitPrice: it.price !== undefined && it.price !== null ? Number(it.price) : undefined,
      total: it.total !== undefined && it.total !== null ? Number(it.total) : undefined,
    }))

    return po
  }

  async findAll(): Promise<any[]> {
    const list = await this.purchaseOrdersRepository.find({
      relations: ["supplier", "warehouse", "items", "items.product"],
      order: { createdAt: "DESC" },
    })

    return list.map((p) => this.mapPurchaseOrder(p))
  }

  async findOne(id: string): Promise<any> {
    const purchaseOrder = await this.loadEntity(id)
    return this.mapPurchaseOrder(purchaseOrder)
  }

  async receive(id: string, itemId: string, quantity: number): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Load entity for mutation
      const purchaseOrder = await this.loadEntity(id)
      const item = purchaseOrder.items.find((i) => i.id === itemId)

      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found in purchase order`)
      }

  // Update received quantity (coerce decimals that may be returned as strings)
  const currentReceived = Number(item.receivedQuantity) || 0
  const addQty = Number(quantity) || 0
  item.receivedQuantity = currentReceived + addQty
  await queryRunner.manager.save(item)

      // Create inventory movement (use internal `code` field for references)
      await this.inventoryService.createMovement({
        type: MovementType.ENTRADA,
        warehouseId: (purchaseOrder as any).warehouseId,
        reference: `PO-${(purchaseOrder as any).code}`,
        notes: `Recepción de orden de compra ${(purchaseOrder as any).code}`,
        items: [
          {
            productId: item.productId,
            quantity,
          },
        ],
      })

      // Update purchase order status
  // Coerce numeric comparisons to avoid string/decimal pitfalls from the driver
  const allItemsReceived = purchaseOrder.items.every((i) => Number(i.receivedQuantity) >= Number(i.quantity))
  const someItemsReceived = purchaseOrder.items.some((i) => Number(i.receivedQuantity) > 0)

      if (allItemsReceived) {
        purchaseOrder.status = "completada" as any
      } else if (someItemsReceived) {
        purchaseOrder.status = "parcial" as any
      }

      await queryRunner.manager.save(purchaseOrder)
      await queryRunner.commitTransaction()

      // Return mapped response expected by frontend
      return await this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.loadEntity(id)
    purchaseOrder.status = "cancelada" as any
    await this.purchaseOrdersRepository.save(purchaseOrder as any)

    // Return mapped response expected by frontend
    return this.mapPurchaseOrder(purchaseOrder) as any
  }

  async registerPayment(id: string, registerPaymentDto: RegisterPaymentDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.loadEntity(id)
    
    // Calcular nuevo monto pagado
    const currentAmountPaid = Number(purchaseOrder.amountPaid) || 0
    const newAmountPaid = currentAmountPaid + Number(registerPaymentDto.amount)
    const total = Number(purchaseOrder.total)

    // Validar que no se pague más del total
    if (newAmountPaid > total) {
      throw new BadRequestException(`El monto total pagado ($${newAmountPaid}) excede el total de la orden ($${total})`)
    }

    // Actualizar monto pagado
    ;(purchaseOrder as any).amountPaid = newAmountPaid

    // Actualizar estado de pago
    if (newAmountPaid >= total) {
      ;(purchaseOrder as any).paymentStatus = "pagado"
    } else if (newAmountPaid > 0) {
      ;(purchaseOrder as any).paymentStatus = "parcial"
    } else {
      ;(purchaseOrder as any).paymentStatus = "pendiente"
    }

    await this.purchaseOrdersRepository.save(purchaseOrder as any)

    this.logger.log(`Payment registered for order ${id}: $${registerPaymentDto.amount}. Total paid: $${newAmountPaid}/${total}`)

    return this.mapPurchaseOrder(purchaseOrder) as any
  }
}
