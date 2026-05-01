import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource, In } from "typeorm"
import { PurchaseOrder } from "./entities/purchase-order.entity"
import { PurchaseOrderItem } from "./entities/purchase-order-item.entity"
import { PurchaseOrderPayment } from "./entities/purchase-order-payment.entity"
import { type CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto"
import { type RegisterPaymentDto } from "./dto/register-payment.dto"
import { InventoryService } from "../inventory/inventory.service"
import { MovementType } from "../inventory/dto/create-movement.dto"
import { TraceabilityService } from "../traceability/traceability.service"
import { Product } from "../products/entities/product.entity"

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name)
  private extractShipmentNumber(notes?: string | null, fallbackValue?: string | null): string | null {
    const rawNotes = String(notes || "")
    const noteMatch = rawNotes.match(/embarque\s*[:#-]?\s*([A-Za-z0-9-]+)/i)
    if (noteMatch?.[1]) {
      return noteMatch[1]
    }

    const fallbackCandidate = String(fallbackValue || "").trim()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fallbackCandidate)
    if (fallbackCandidate && !isUuid) {
      return fallbackCandidate
    }

    return null
  }

  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrdersRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemsRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(PurchaseOrderPayment)
    private purchaseOrderPaymentsRepository: Repository<PurchaseOrderPayment>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
    private traceabilityService: TraceabilityService,
  ) {}

  private roundCurrency(value: number): number {
    return Number((Number(value) || 0).toFixed(2))
  }

  private async calculateTotalsByProductIva(
    items: Array<{ productId: string; quantity: number; unitPrice: number }>,
    manager: any,
  ): Promise<{ subtotal: number; tax: number; total: number }> {
    const productIds = Array.from(new Set(items.map((item) => item.productId).filter(Boolean)))

    const productRepo: Repository<Product> = manager?.getRepository
      ? manager.getRepository(Product)
      : this.productsRepository

    const products = productIds.length
      ? await productRepo.find({
          where: { id: In(productIds) } as any,
        })
      : []

    const hasIvaMap = new Map<string, boolean>(
      products.map((product: any) => [product.id, product.hasIva16 !== false]),
    )

    let subtotal = 0
    let tax = 0

    for (const item of items) {
      const lineSubtotal = Number(item.quantity) * Number(item.unitPrice)
      subtotal += lineSubtotal
      const appliesIva = hasIvaMap.has(item.productId) ? hasIvaMap.get(item.productId) : true
      if (appliesIva) {
        tax += lineSubtotal * 0.16
      }
    }

    subtotal = this.roundCurrency(subtotal)
    tax = this.roundCurrency(tax)
    const total = this.roundCurrency(subtotal + tax)

    return { subtotal, tax, total }
  }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, req?: any): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
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
        subtotal: 0,
        tax: 0,
        total: 0,
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

    const normalizedItems: Array<{ productId: string; quantity: number; unitPrice: number; notes?: string }> = []

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

        normalizedItems.push({
          productId: itemDto.productId,
          quantity: qty,
          unitPrice: price,
          notes: itemDto.notes,
        })

      }

      const totals = await this.calculateTotalsByProductIva(
        normalizedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        queryRunner.manager,
      )

      await queryRunner.manager.update(PurchaseOrder, (purchaseOrder as any).id, {
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      } as any)

      for (const normalizedItem of normalizedItems) {
        const price = normalizedItem.unitPrice
        const qty = normalizedItem.quantity

        // Build a plain object and insert explicitly. Using strings for DECIMAL
        // fields avoids precision/parameterization issues with some drivers.
        const plainItem = {
          purchaseOrderId: (purchaseOrder as any).id,
          productId: normalizedItem.productId,
          quantity: qty,
          receivedQuantity: 0,
          // Store as strings with 2 decimals to match DECIMAL columns
          price: price.toFixed(2),
          total: (qty * price).toFixed(2),
          notes: normalizedItem.notes,
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

      const created = await this.findOne((purchaseOrder as any).id)
      await this.traceabilityService.record({
        entityType: 'purchase_order',
        entityId: (purchaseOrder as any).id,
        action: 'created',
        userId: req?.user?.id || req?.user?.username || 'unknown',
        userName: req?.user?.name || req?.user?.username || 'unknown',
        details: { changes: createPurchaseOrderDto },
        result: 'success',
      })
      return created
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async update(id: string, updateDto: any, req?: any): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const purchaseOrder = await this.loadEntity(id)

      // If any item already has receivedQuantity > 0, block editing
      const anyReceived = (purchaseOrder.items || []).some((i) => Number(i.receivedQuantity) > 0)
      if (anyReceived) {
        throw new BadRequestException('Esta orden no puede editarse porque ya tiene una recepción registrada.')
      }

      // Disallow supplier change via edit
      if (updateDto.supplierId && updateDto.supplierId !== (purchaseOrder as any).supplierId) {
        throw new BadRequestException('Para cambiar el proveedor debe cancelar esta orden y crear una nueva.')
      }

      const fieldsToUpdate: any = {}

      // Update simple fields
      if (updateDto.warehouseId !== undefined) {
        fieldsToUpdate.warehouseId = updateDto.warehouseId
      }
      if (updateDto.notes !== undefined) {
        fieldsToUpdate.notes = updateDto.notes
      }
      if (updateDto.expectedDate !== undefined) {
        fieldsToUpdate.expectedDate = updateDto.expectedDate
      }
      if (updateDto.creditDays !== undefined) {
        const creditDays = Number(updateDto.creditDays) || 0
        fieldsToUpdate.paymentTerms = creditDays
        const baseDate = (purchaseOrder as any).date ? new Date((purchaseOrder as any).date) : new Date()
        const dueDate = new Date(baseDate)
        dueDate.setDate(dueDate.getDate() + creditDays)
        fieldsToUpdate.dueDate = dueDate
      }

      // Replace items if provided
      if (Array.isArray(updateDto.items)) {
        // Delete existing items
        await queryRunner.query(`DELETE FROM purchase_order_items WHERE purchase_order_id = $1`, [id])

        const normalizedItems: Array<{ productId: string; quantity: number; unitPrice: number; notes?: string }> = []

        for (const item of updateDto.items) {
          const price = Number(item.unitPrice ?? item.price ?? 0)
          const qty = Number(item.quantity ?? 0)

          if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) {
            throw new BadRequestException(`Ítem inválido para producto ${item?.productId}`)
          }

          normalizedItems.push({
            productId: item.productId,
            quantity: qty,
            unitPrice: price,
            notes: item.notes,
          })

          const itemTotal = (qty * price) || 0

          await queryRunner.query(
            `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, received_quantity, price, total, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [id, item.productId, qty, 0, price.toFixed ? price.toFixed(2) : String(price), itemTotal.toFixed ? itemTotal.toFixed(2) : String(itemTotal), item.notes || null],
          )
        }

        const totals = await this.calculateTotalsByProductIva(
          normalizedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          queryRunner.manager,
        )

        fieldsToUpdate.subtotal = totals.subtotal
        fieldsToUpdate.tax = totals.tax
        fieldsToUpdate.total = totals.total
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        await queryRunner.manager.update(PurchaseOrder, id, fieldsToUpdate)
      }

      // Commit update
      await queryRunner.commitTransaction()

      const updated = await this.findOne(id)
      await this.traceabilityService.record({
        entityType: 'purchase_order',
        entityId: id,
        action: 'updated',
        userId: req?.user?.id || req?.user?.username || 'unknown',
        userName: req?.user?.name || req?.user?.username || 'unknown',
        details: { changes: updateDto },
        result: 'success',
      })
      return updated
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  // Load the PurchaseOrder entity (used internally for DB updates)
  private async loadEntity(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrdersRepository.findOne({
      where: { id },
      relations: ["supplier", "warehouse", "items", "items.product", "payments"],
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

    po.payments = [...(purchaseOrder.payments || [])]
      .sort((a: any, b: any) => new Date(a.createdAt || a.paymentDate || 0).getTime() - new Date(b.createdAt || b.paymentDate || 0).getTime())
      .map((payment: any) => ({
        ...payment,
        amount: payment.amount !== undefined ? Number(payment.amount) : 0,
      }))

    return po
  }

  async findAll(supplierId?: string): Promise<any[]> {
    const where: any = {}
    if (supplierId) {
      where.supplier = { id: supplierId }
    }

    const list = await this.purchaseOrdersRepository.find({
      where: Object.keys(where).length ? where : undefined,
      relations: ["supplier", "warehouse", "items", "items.product", "payments"],
      order: { createdAt: "DESC" },
    })

    return list.map((p) => this.mapPurchaseOrder(p))
  }

  async findOne(id: string): Promise<any> {
    const purchaseOrder = await this.loadEntity(id)
    const mapped = this.mapPurchaseOrder(purchaseOrder)
    try {
      mapped.traceability = await this.traceabilityService.findByEntity('purchase_order', id)
    } catch {
      mapped.traceability = []
    }
    return mapped
  }

  /**
   * Find purchase orders that have a pending balance (total - amount_paid > 0)
   * Optional filters: supplierId, startDate, endDate (filter by due date range)
   */
  async findPending(opts?: { supplierId?: string; startDate?: string; endDate?: string }): Promise<any[]> {
    const qb = this.purchaseOrdersRepository.createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .where('(COALESCE(po.total::numeric,0) - COALESCE(po.amount_paid::numeric,0)) > 0')

    if (opts?.supplierId) {
      qb.andWhere('po.supplier_id = :supplierId', { supplierId: opts.supplierId })
    }

    if (opts?.startDate) {
      qb.andWhere('po.due_date >= :startDate', { startDate: opts.startDate })
    }

    if (opts?.endDate) {
      qb.andWhere('po.due_date <= :endDate', { endDate: opts.endDate })
    }

    qb.orderBy('po.due_date', 'ASC')

    const orders = await qb.getMany()

    // Map to API shape with pending amount and supplier info
    return orders.map((po: any) => {
      const total = Number(po.total || 0)
      const amountPaid = Number(po.amountPaid || po.amount_paid || 0)
      const pending = Math.max(0, total - amountPaid)

      return {
        id: po.id,
        code: po.code,
        supplierId: po.supplierId,
        supplierName: po.supplier ? (po.supplier.name || po.supplier.fullName || po.supplier.companyName) : null,
        shipmentId: (po as any).shipmentId || null,
        shipmentNumber: this.extractShipmentNumber((po as any).notes, (po as any).shipmentId || null),
        total,
        date: po.date,
        dueDate: po.dueDate,
        amountPaid,
        pendingAmount: pending,
      }
    })
  }

  async findPayments(opts?: { supplierId?: string; startDate?: string; endDate?: string; status?: string }): Promise<any[]> {
    const qb = this.purchaseOrderPaymentsRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.purchaseOrder', 'po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .orderBy('payment.payment_date', 'DESC')

    if (opts?.supplierId) {
      qb.andWhere('po.supplier_id = :supplierId', { supplierId: opts.supplierId })
    }

    if (opts?.startDate) {
      qb.andWhere('payment.payment_date >= :startDate', { startDate: opts.startDate })
    }

    if (opts?.endDate) {
      qb.andWhere('payment.payment_date <= :endDate', { endDate: opts.endDate })
    }

    if (opts?.status) {
      qb.andWhere('po.payment_status = :status', { status: opts.status })
    }

    const payments = await qb.getMany()

    return payments.map((p: any) => ({
      id: p.id,
      purchaseOrderId: p.purchaseOrderId,
      purchaseOrderCode: p.purchaseOrder?.code || null,
      supplierId: p.purchaseOrder?.supplierId || null,
      supplierName: p.purchaseOrder?.supplier ? (p.purchaseOrder.supplier.name || p.purchaseOrder.supplier.companyName) : null,
      paymentDate: p.paymentDate,
      amount: Number(p.amount),
      reference: p.reference,
      notes: p.notes,
      invoiceFileUrl: p.invoiceFileUrl,
      createdAt: p.createdAt,
      purchaseOrderStatus: p.purchaseOrder?.paymentStatus || p.purchaseOrder?.status || null,
    }))
  }

  async receive(id: string, itemId: string, quantity: number, userName?: string): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    // Use provided userName or default to "sistema"
    const createdByUser = userName || "sistema"

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
        referenceType: "PO",
        referenceId: id,
        notes: `Recepción de orden de compra ${(purchaseOrder as any).code}`,
        items: [
          {
            productId: item.productId,
            quantity,
            cost: Number(item.price),
          },
        ],
        queryRunner,
        createdBy: createdByUser,
      } as any)

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

  async cancel(id: string, req?: any): Promise<PurchaseOrder> {
    const purchaseOrder = await this.loadEntity(id)
    purchaseOrder.status = "cancelada" as any
    await this.purchaseOrdersRepository.save(purchaseOrder as any)

    await this.traceabilityService.record({
      entityType: 'purchase_order',
      entityId: id,
      action: 'cancelled',
      userId: req?.user?.id || req?.user?.username || 'unknown',
      userName: req?.user?.name || req?.user?.username || 'unknown',
      result: 'success',
    })

    // Return mapped response expected by frontend
    return this.mapPurchaseOrder(purchaseOrder) as any
  }

  async registerPayment(id: string, registerPaymentDto: RegisterPaymentDto): Promise<PurchaseOrder> {
    // Use a transaction to avoid saving a payment if updating the purchase order fails
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const purchaseOrder = await this.loadEntity(id)

      const amount = Number(registerPaymentDto.amount || 0)
      if (amount <= 0) {
        throw new BadRequestException("El monto del pago debe ser mayor a cero")
      }

      const currentAmountPaid = Number(purchaseOrder.amountPaid) || 0
      const newAmountPaid = currentAmountPaid + amount
      const total = Number(purchaseOrder.total)

      if (newAmountPaid > total) {
        throw new BadRequestException(`El monto total pagado ($${newAmountPaid}) excede el total de la orden ($${total})`)
      }

      ;(purchaseOrder as any).amountPaid = newAmountPaid

      if (newAmountPaid >= total) {
        ;(purchaseOrder as any).paymentStatus = "pagado"
      } else if (newAmountPaid > 0) {
        ;(purchaseOrder as any).paymentStatus = "parcial"
      } else {
        ;(purchaseOrder as any).paymentStatus = "pendiente"
      }

      // Persist changes and create payment inside the same transaction
      await queryRunner.manager.save(purchaseOrder as any)

      const paymentDate = registerPaymentDto.paymentDate ? new Date(registerPaymentDto.paymentDate) : new Date()

      const payment = this.purchaseOrderPaymentsRepository.create({
        purchaseOrderId: id,
        paymentDate,
        amount,
        reference: registerPaymentDto.reference || registerPaymentDto.paymentMethod,
        notes: registerPaymentDto.notes,
        invoiceFileUrl: registerPaymentDto.invoiceFileUrl,
      })

      await queryRunner.manager.save(payment)

      await queryRunner.commitTransaction()

      this.logger.log(`Payment registered for order ${id}: $${amount}. Total paid: $${newAmountPaid}/${total}`)

      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error(`Failed to register payment for order ${id}: ${error}`)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

}
