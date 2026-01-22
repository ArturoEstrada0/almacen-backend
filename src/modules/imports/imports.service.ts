import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Between } from "typeorm"
import * as XLSX from "xlsx"
import { ProductsService } from "../products/products.service"
import { WarehousesService } from "../warehouses/warehouses.service"
import { ProducersService } from "../producers/producers.service"
import { Product } from "../products/entities/product.entity"
import { InventoryItem } from "../inventory/entities/inventory-item.entity"
import { Movement } from "../inventory/entities/movement.entity"
import { Supplier } from "../suppliers/entities/supplier.entity"
import { Producer } from "../producers/entities/producer.entity"
import { Warehouse } from "../warehouses/entities/warehouse.entity"
import { FruitReception } from "../producers/entities/fruit-reception.entity"
import type { ExportProductsDto, ExportInventoryDto, ExportMovementsDto, ExportSuppliersDto, ExportFruitReceptionsDto } from "./dto/export-query.dto"

@Injectable()
export class ImportsService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly warehousesService: WarehousesService,
    private readonly producersService: ProducersService,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Movement)
    private readonly movementsRepository: Repository<Movement>,
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
    @InjectRepository(Producer)
    private readonly producersRepository: Repository<Producer>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    @InjectRepository(FruitReception)
    private readonly fruitReceptionsRepository: Repository<FruitReception>,
  ) {}

  async importFile(buffer: Buffer, mapping: Record<string, string>, type: string, sheetName?: string) {
    if (!buffer) throw new BadRequestException('No file provided')
    if (!type) throw new BadRequestException('No import type provided')

    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]]
    if (!sheet) throw new BadRequestException('Sheet not found')

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[]
    if (!rows || rows.length < 2) {
      return { processed: 0, success: 0, errors: ['No rows found in sheet'] }
    }

    const headers: string[] = rows[0].map((h: any) => (h ?? '').toString().trim())
    const dataRows = rows.slice(1)

    const result = { processed: dataRows.length, success: 0, errors: [] as any[] }

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNumber = i + 2

      try {
        if (type === 'products') {
          const dto: any = {}
          const skuCol = mapping['sku']
          const nameCol = mapping['name']
          if (!skuCol || !nameCol) throw new Error('SKU or Name mapping missing')

          const sku = row[headers.indexOf(skuCol)] ?? ''
          const name = row[headers.indexOf(nameCol)] ?? ''
          if (!sku || !name) throw new Error('SKU or Name empty')

          dto.sku = String(sku).trim()
          dto.name = String(name).trim()
          if (mapping['description']) dto.description = String(row[headers.indexOf(mapping['description'])] ?? '').trim()
          if (mapping['category']) dto.categoryId = String(row[headers.indexOf(mapping['category'])] ?? '').trim()
          if (mapping['minStock']) dto.minStock = Number(row[headers.indexOf(mapping['minStock'])] ?? 0)
          if (mapping['maxStock']) dto.maxStock = Number(row[headers.indexOf(mapping['maxStock'])] ?? 0)
          if (mapping['unitOfMeasure']) dto.unitOfMeasure = String(row[headers.indexOf(mapping['unitOfMeasure'])] ?? '').trim()

          await this.productsService.create(dto)
          result.success++
        } else if (type === 'inventory') {
          const skuCol = mapping['sku']
          const warehouseCol = mapping['warehouse']
          const quantityCol = mapping['quantity']
          
          if (!skuCol || !warehouseCol || !quantityCol) {
            throw new Error('SKU, Warehouse or Quantity mapping missing')
          }

          const sku = String(row[headers.indexOf(skuCol)] ?? '').trim()
          const warehouseCode = String(row[headers.indexOf(warehouseCol)] ?? '').trim()
          const quantity = Number(row[headers.indexOf(quantityCol)] ?? 0)

          if (!sku || !warehouseCode) throw new Error('SKU or Warehouse empty')

          const product = await this.productsRepository.findOne({ where: { sku } })
          if (!product) throw new Error(`Product with SKU ${sku} not found`)

          const warehouse = await this.warehousesService.findByCode(warehouseCode)
          if (!warehouse) throw new Error(`Warehouse ${warehouseCode} not found`)

          let inventoryItem = await this.inventoryRepository.findOne({
            where: { productId: product.id, warehouseId: warehouse.id }
          })

          if (inventoryItem) {
            inventoryItem.quantity = quantity
          } else {
            inventoryItem = this.inventoryRepository.create({
              productId: product.id,
              warehouseId: warehouse.id,
              quantity,
              minStock: 0,
              maxStock: 0,
              reorderPoint: 0,
            })
          }

          if (mapping['location']) {
            const location = String(row[headers.indexOf(mapping['location'])] ?? '').trim()
            if (location) inventoryItem.locationCode = location
          }
          if (mapping['lotNumber']) {
            const lotNumber = String(row[headers.indexOf(mapping['lotNumber'])] ?? '').trim()
            if (lotNumber) inventoryItem.lotNumber = lotNumber
          }
          if (mapping['expirationDate']) {
            const expDate = row[headers.indexOf(mapping['expirationDate'])]
            if (expDate) inventoryItem.expirationDate = new Date(expDate)
          }
          if (mapping['costPrice']) {
            const cost = Number(row[headers.indexOf(mapping['costPrice'])] ?? 0)
            if (cost) product.cost = cost
          }

          // Guardar cambios en el producto si se actualizó el precio de costo
          if (mapping['costPrice']) {
            await this.productsRepository.save(product)
          }

          await this.inventoryRepository.save(inventoryItem)
          result.success++
        } else if (type === 'suppliers') {
          const codeCol = mapping['code']
          const nameCol = mapping['businessName']
          const rfcCol = mapping['rfc']
          const emailCol = mapping['email']
          const phoneCol = mapping['phone']
          const addressCol = mapping['address']
          const creditDaysCol = mapping['creditDays']

          if (!codeCol || !nameCol || !rfcCol) {
            throw new Error('Code, Business Name or RFC mapping missing')
          }

          const code = String(row[headers.indexOf(codeCol)] ?? '').trim()
          const name = String(row[headers.indexOf(nameCol)] ?? '').trim()
          const rfc = String(row[headers.indexOf(rfcCol)] ?? '').trim()

          if (!code || !name || !rfc) throw new Error('Code, Name or RFC empty')

          const dto: any = {
            code,
            name,
            rfc,
          }
          if (emailCol) dto.email = String(row[headers.indexOf(emailCol)] ?? '').trim()
          if (phoneCol) dto.phone = String(row[headers.indexOf(phoneCol)] ?? '').trim()
          if (addressCol) dto.address = String(row[headers.indexOf(addressCol)] ?? '').trim()
          if (creditDaysCol) dto.paymentTerms = Number(row[headers.indexOf(creditDaysCol)] ?? 30)

          await this.suppliersRepository.save(this.suppliersRepository.create(dto))
          result.success++
        } else if (type === 'warehouses') {
          const codeCol = mapping['code']
          const nameCol = mapping['name']
          if (!codeCol || !nameCol) throw new Error('Code or Name mapping missing')

          const code = row[headers.indexOf(codeCol)] ?? ''
          const name = row[headers.indexOf(nameCol)] ?? ''
          if (!code || !name) throw new Error('Code or Name empty')

          const dto: any = {
            code: String(code).trim(),
            name: String(name).trim(),
          }
          if (mapping['address']) dto.address = String(row[headers.indexOf(mapping['address'])] ?? '').trim()
          if (mapping['phone']) dto.phone = String(row[headers.indexOf(mapping['phone'])] ?? '').trim()
          if (mapping['email']) dto.email = String(row[headers.indexOf(mapping['email'])] ?? '').trim()

          await this.warehousesService.create(dto)
          result.success++
        } else if (type === 'input-assignments') {
          // Importación de asignación de insumos
          const producerCol = mapping['producer']
          const warehouseCol = mapping['warehouse']
          const dateCol = mapping['date']
          const skuCol = mapping['sku']
          const quantityCol = mapping['quantity']

          if (!producerCol || !warehouseCol || !skuCol || !quantityCol) {
            throw new Error('Productor, Almacén, SKU o Cantidad mapping missing')
          }

          const producerCode = String(row[headers.indexOf(producerCol)] ?? '').trim()
          const warehouseCode = String(row[headers.indexOf(warehouseCol)] ?? '').trim()
          const sku = String(row[headers.indexOf(skuCol)] ?? '').trim()
          const quantity = Number(row[headers.indexOf(quantityCol)] ?? 0)

          if (!producerCode || !warehouseCode || !sku) {
            throw new Error('Productor, Almacén o SKU vacío')
          }

          // Buscar productor por código o nombre
          const producer = await this.producersRepository.findOne({ 
            where: [
              { code: producerCode },
              { name: producerCode }
            ]
          })
          if (!producer) throw new Error(`Productor ${producerCode} no encontrado`)

          // Buscar almacén
          const warehouse = await this.warehousesService.findByCode(warehouseCode)
          if (!warehouse) throw new Error(`Almacén ${warehouseCode} no encontrado`)

          // Buscar producto
          const product = await this.productsRepository.findOne({ where: { sku } })
          if (!product) throw new Error(`Producto con SKU ${sku} no encontrado`)
          
          // Usar el precio de costo del producto
          const unitPrice = product.cost || 0

          // Obtener fecha
          let assignmentDate = new Date().toISOString().split('T')[0]
          if (dateCol) {
            const dateValue = row[headers.indexOf(dateCol)]
            if (dateValue) {
              if (typeof dateValue === 'number') {
                // Excel serial date
                const excelDate = new Date((dateValue - 25569) * 86400 * 1000)
                assignmentDate = excelDate.toISOString().split('T')[0]
              } else {
                assignmentDate = new Date(dateValue).toISOString().split('T')[0]
              }
            }
          }

          // Notas opcionales
          let notes = ''
          if (mapping['notes']) {
            notes = String(row[headers.indexOf(mapping['notes'])] ?? '').trim()
          }

          // Crear asignación de insumos
          await this.producersService.createInputAssignment({
            producerId: producer.id,
            warehouseId: warehouse.id,
            date: assignmentDate,
            notes,
            items: [{
              productId: product.id,
              quantity,
              unitPrice,
            }],
          })
          result.success++
        } else if (type === 'fruit-receptions') {
          // Importación de recepción de fruta
          const producerCol = mapping['producer']
          const warehouseCol = mapping['warehouse']
          const productCol = mapping['product']
          const dateCol = mapping['date']
          const boxesCol = mapping['boxes']

          if (!producerCol || !warehouseCol || !productCol || !boxesCol) {
            throw new Error('Productor, Almacén, Producto o Cajas mapping missing')
          }

          const producerCode = String(row[headers.indexOf(producerCol)] ?? '').trim()
          const warehouseCode = String(row[headers.indexOf(warehouseCol)] ?? '').trim()
          const productSku = String(row[headers.indexOf(productCol)] ?? '').trim()
          const boxes = Number(row[headers.indexOf(boxesCol)] ?? 0)

          if (!producerCode || !warehouseCode || !productSku || boxes <= 0) {
            throw new Error('Datos incompletos o cajas inválidas')
          }

          // Buscar productor
          const producer = await this.producersRepository.findOne({ 
            where: [
              { code: producerCode },
              { name: producerCode }
            ]
          })
          if (!producer) throw new Error(`Productor ${producerCode} no encontrado`)

          // Buscar almacén
          const warehouse = await this.warehousesService.findByCode(warehouseCode)
          if (!warehouse) throw new Error(`Almacén ${warehouseCode} no encontrado`)

          // Buscar producto
          const product = await this.productsRepository.findOne({ where: { sku: productSku } })
          if (!product) throw new Error(`Producto con SKU ${productSku} no encontrado`)

          // Obtener fecha
          let receptionDate = new Date().toISOString().split('T')[0]
          if (dateCol) {
            const dateValue = row[headers.indexOf(dateCol)]
            if (dateValue) {
              if (typeof dateValue === 'number') {
                const excelDate = new Date((dateValue - 25569) * 86400 * 1000)
                receptionDate = excelDate.toISOString().split('T')[0]
              } else {
                receptionDate = new Date(dateValue).toISOString().split('T')[0]
              }
            }
          }

          // Campos opcionales
          let weightPerBox = null
          let totalWeight = null
          let notes = ''

          if (mapping['weightPerBox']) {
            weightPerBox = Number(row[headers.indexOf(mapping['weightPerBox'])] ?? 0) || null
          }
          if (mapping['totalWeight']) {
            totalWeight = Number(row[headers.indexOf(mapping['totalWeight'])] ?? 0) || null
          }
          if (mapping['notes']) {
            notes = String(row[headers.indexOf(mapping['notes'])] ?? '').trim()
          }

          // Procesar materiales devueltos (caja, clam, tarima, interlock, producto)
          const returnedItems: any[] = []
          
          // Buscar dinámicamente todas las columnas numeradas para cada tipo
          const materialCategories = [
            { prefix: 'codigoCaja', qtyPrefix: 'cantidadCaja' },
            { prefix: 'codigoClam', qtyPrefix: 'cantidadClam' },
            { prefix: 'codigoTarima', qtyPrefix: 'cantidadTarima' },
            { prefix: 'codigoInterlock', qtyPrefix: 'cantidadInterlock' },
            { prefix: 'codigoProducto', qtyPrefix: 'cantidadProducto' },
          ]
          
          for (const category of materialCategories) {
            // Buscar columnas numeradas (1, 2, 3, etc.)
            let index = 1
            let foundColumn = true
            
            while (foundColumn) {
              const skuKey = index === 1 ? category.prefix : `${category.prefix}${index}`
              const qtyKey = index === 1 ? category.qtyPrefix : `${category.qtyPrefix}${index}`
              
              const skuCol = mapping[skuKey]
              const qtyCol = mapping[qtyKey]
              
              if (skuCol && qtyCol) {
                const sku = String(row[headers.indexOf(skuCol)] ?? '').trim()
                const quantity = Number(row[headers.indexOf(qtyCol)] ?? 0)
                
                if (sku && quantity > 0) {
                  // Buscar el producto devuelto
                  const returnedProduct = await this.productsRepository.findOne({ where: { sku } })
                  if (returnedProduct) {
                    // Usar automáticamente el precio de costo del producto como precio unitario
                    const unitPrice = returnedProduct.cost || 0
                    
                    returnedItems.push({
                      productId: returnedProduct.id,
                      quantity,
                      unitPrice,
                    })
                  }
                }
                index++
              } else {
                foundColumn = false
              }
            }
          }

          // Crear recepción de fruta
          await this.producersService.createFruitReception({
            producerId: producer.id,
            warehouseId: warehouse.id,
            productId: product.id,
            date: receptionDate,
            boxes,
            weightPerBox,
            totalWeight,
            notes,
            returnedItems: returnedItems.length > 0 ? returnedItems : undefined,
          })
          result.success++
        } else if (type === 'initial-stock') {
          // Carga inicial de inventario por almacén (sin crear movimiento)
          const skuCol = mapping['sku']
          const warehouseCol = mapping['warehouse']
          const quantityCol = mapping['quantity']
          
          if (!skuCol || !warehouseCol || !quantityCol) {
            throw new Error('SKU, Almacén o Cantidad mapping missing')
          }

          const sku = String(row[headers.indexOf(skuCol)] ?? '').trim()
          const warehouseCode = String(row[headers.indexOf(warehouseCol)] ?? '').trim()
          const quantity = Number(row[headers.indexOf(quantityCol)] ?? 0)

          if (!sku || !warehouseCode) throw new Error('SKU o Almacén vacío')

          const product = await this.productsRepository.findOne({ where: { sku } })
          if (!product) throw new Error(`Producto con SKU ${sku} no encontrado`)

          // Buscar almacén por código o por ID si está disponible
          let warehouse
          if (mapping['warehouseId']) {
            const warehouseId = String(row[headers.indexOf(mapping['warehouseId'])] ?? '').trim()
            if (warehouseId) {
              warehouse = await this.warehousesRepository.findOne({ where: { id: warehouseId } })
            }
          }
          if (!warehouse) {
            warehouse = await this.warehousesService.findByCode(warehouseCode)
          }
          if (!warehouse) throw new Error(`Almacén ${warehouseCode} no encontrado`)

          let inventoryItem = await this.inventoryRepository.findOne({
            where: { productId: product.id, warehouseId: warehouse.id }
          })

          if (inventoryItem) {
            inventoryItem.quantity = quantity
          } else {
            inventoryItem = this.inventoryRepository.create({
              productId: product.id,
              warehouseId: warehouse.id,
              quantity,
              minStock: 0,
              maxStock: 0,
              reorderPoint: 0,
            })
          }

          // Campos opcionales
          if (mapping['location']) {
            const location = String(row[headers.indexOf(mapping['location'])] ?? '').trim()
            if (location) inventoryItem.locationCode = location
          }
          if (mapping['lotNumber']) {
            const lotNumber = String(row[headers.indexOf(mapping['lotNumber'])] ?? '').trim()
            if (lotNumber) inventoryItem.lotNumber = lotNumber
          }
          if (mapping['expirationDate']) {
            const expDate = row[headers.indexOf(mapping['expirationDate'])]
            if (expDate && expDate !== '' && expDate !== null && expDate !== undefined) {
              if (typeof expDate === 'number' && !isNaN(expDate)) {
                const date = new Date((expDate - 25569) * 86400 * 1000)
                if (!isNaN(date.getTime())) {
                  inventoryItem.expirationDate = date
                }
              } else if (typeof expDate === 'string') {
                const date = new Date(expDate)
                if (!isNaN(date.getTime())) {
                  inventoryItem.expirationDate = date
                }
              } else if (expDate instanceof Date && !isNaN(expDate.getTime())) {
                inventoryItem.expirationDate = expDate
              }
            }
          }
          if (mapping['minStock']) {
            inventoryItem.minStock = Number(row[headers.indexOf(mapping['minStock'])] ?? 0)
          }
          if (mapping['maxStock']) {
            inventoryItem.maxStock = Number(row[headers.indexOf(mapping['maxStock'])] ?? 0)
          }
          if (mapping['reorderPoint']) {
            inventoryItem.reorderPoint = Number(row[headers.indexOf(mapping['reorderPoint'])] ?? 0)
          }
          if (mapping['costPrice']) {
            const cost = Number(row[headers.indexOf(mapping['costPrice'])] ?? 0)
            if (cost) {
              product.cost = cost
              await this.productsRepository.save(product)
            }
          }

          await this.inventoryRepository.save(inventoryItem)
          result.success++
        } else {
          throw new Error('Unsupported import type')
        }
      } catch (err: any) {
        result.errors.push({ row: rowNumber, error: err.message || String(err) })
      }
    }

    return result
  }

  async exportProducts(query: ExportProductsDto): Promise<Buffer> {
    const products = await this.productsRepository.find({
      relations: ["category", "unit"],
      where: query.includeInactive === false ? { active: true } : {},
      order: { sku: "ASC" },
    })

    const data = products.map(p => ({
      SKU: p.sku,
      Nombre: p.name,
      Descripción: p.description || "",
      Categoría: p.category?.name || "",
      "Unidad de Medida": p.unit?.name || "",
      Activo: p.active ? "Sí" : "No",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Productos")

    return query.format === "csv" 
      ? Buffer.from(XLSX.utils.sheet_to_csv(ws))
      : XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  }

  async exportInventory(query: ExportInventoryDto): Promise<Buffer> {
    const qb = this.inventoryRepository.createQueryBuilder("inv")
      .leftJoinAndSelect("inv.product", "product")
      .leftJoinAndSelect("inv.warehouse", "warehouse")
      .leftJoinAndSelect("product.unit", "unit")

    if (query.warehouseId && query.warehouseId !== "all") {
      qb.andWhere("inv.warehouseId = :warehouseId", { warehouseId: query.warehouseId })
    }

    if (!query.includeZeroStock) {
      qb.andWhere("inv.quantity > 0")
    }

    const items = await qb.orderBy("product.sku", "ASC").getMany()

    const data = items.map(item => {
      const row: any = {
        SKU: item.product.sku,
        Producto: item.product.name,
        Almacén: item.warehouse.name,
        "Unidad de Medida": item.product.unit?.name || "",
        Ubicación: item.locationCode || "",
        Disponible: item.quantity,
        "Stock Mínimo": item.minStock || 0,
        "Stock Máximo": item.maxStock || 0,
        "Punto de Reorden": item.reorderPoint || 0,
        "Precio de Costo": item.product.cost || 0,
      }

      if (query.includeLots) {
        row.Lote = item.lotNumber || ""
        row.Vencimiento = item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : ""
      }

      return row
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inventario")

    return query.format === "csv"
      ? Buffer.from(XLSX.utils.sheet_to_csv(ws))
      : XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  }

  async exportMovements(query: ExportMovementsDto): Promise<Buffer> {
    const qb = this.movementsRepository.createQueryBuilder("mov")
      .leftJoinAndSelect("mov.warehouse", "warehouse")
      .leftJoinAndSelect("mov.items", "items")
      .leftJoinAndSelect("items.product", "product")

    if (query.startDate && query.endDate) {
      qb.andWhere("mov.createdAt BETWEEN :startDate AND :endDate", {
        startDate: query.startDate,
        endDate: query.endDate,
      })
    }

    if (query.type && query.type !== "all") {
      qb.andWhere("mov.type = :type", { type: query.type })
    }

    const movements = await qb.orderBy("mov.createdAt", "DESC").getMany()

    const data: any[] = []
    movements.forEach(mov => {
      mov.items?.forEach(item => {
        data.push({
          Fecha: new Date(mov.createdAt).toLocaleDateString(),
          Tipo: mov.type,
          Almacén: mov.warehouse?.name || "",
          SKU: item.product?.sku || "",
          Cantidad: item.quantity,
          "Número de Lote": "", // No hay campo de lote en MovementItem, se puede agregar si es necesario
          "Costo Unitario": item.cost || 0,
          Notas: item.notes || mov.notes || "",
        })
      })
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos")

    return query.format === "csv"
      ? Buffer.from(XLSX.utils.sheet_to_csv(ws))
      : XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  }

  async exportSuppliers(query: ExportSuppliersDto): Promise<Buffer> {
    const suppliers = await this.suppliersRepository.find({
      where: query.includeInactive === false ? { active: true } : {},
      order: { code: "ASC" },
    })

    const data = suppliers.map(s => ({
      Código: s.code,
      "Razón Social": s.name,
      RFC: s.rfc,
      Email: s.email || "",
      Teléfono: s.phone || "",
      Dirección: s.address || "",
      "Días de Crédito": s.paymentTerms || 0,
      Activo: s.active ? "Sí" : "No",
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Proveedores")

    return query.format === "csv"
      ? Buffer.from(XLSX.utils.sheet_to_csv(ws))
      : XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  }

  async exportFruitReceptions(query: ExportFruitReceptionsDto): Promise<Buffer> {
    const qb = this.fruitReceptionsRepository.createQueryBuilder("reception")
      .leftJoinAndSelect("reception.producer", "producer")
      .leftJoinAndSelect("reception.warehouse", "warehouse")
      .leftJoinAndSelect("reception.product", "product")
      .leftJoinAndSelect("reception.returnedItems", "returnedItems")
      .leftJoinAndSelect("returnedItems.product", "returnedProduct")

    if (query.startDate && query.endDate) {
      qb.andWhere("reception.date BETWEEN :startDate AND :endDate", {
        startDate: query.startDate,
        endDate: query.endDate,
      })
    }

    if (query.producerId && query.producerId !== "all") {
      qb.andWhere("reception.producerId = :producerId", { producerId: query.producerId })
    }

    if (query.warehouseId && query.warehouseId !== "all") {
      qb.andWhere("reception.warehouseId = :warehouseId", { warehouseId: query.warehouseId })
    }

    if (query.shipmentStatus && query.shipmentStatus !== "all") {
      qb.andWhere("reception.shipmentStatus = :shipmentStatus", { shipmentStatus: query.shipmentStatus })
    }

    if (query.paymentStatus && query.paymentStatus !== "all") {
      qb.andWhere("reception.paymentStatus = :paymentStatus", { paymentStatus: query.paymentStatus })
    }

    const receptions = await qb.orderBy("reception.date", "DESC").getMany()

    // Primero, determinar el máximo de productos por categoría en todas las recepciones
    let maxCajas = 0
    let maxClams = 0
    let maxTarimas = 0
    let maxInterlocks = 0
    let maxOtros = 0

    if (query.includeReturnedItems) {
      receptions.forEach(reception => {
        if (reception.returnedItems && reception.returnedItems.length > 0) {
          let cajaCount = 0, clamCount = 0, tarimaCount = 0, interlockCount = 0, otroCount = 0

          reception.returnedItems.forEach((item: any) => {
            const productSku = (item.product?.sku || "").toLowerCase()
            const productName = (item.product?.name || "").toLowerCase()

            if (productSku.includes("caja") || productName.includes("caja")) {
              cajaCount++
            } else if (productSku.includes("clam") || productName.includes("clam")) {
              clamCount++
            } else if (productSku.includes("tarima") || productName.includes("tarima")) {
              tarimaCount++
            } else if (productSku.includes("interlock") || productName.includes("interlock")) {
              interlockCount++
            } else {
              otroCount++
            }
          })

          maxCajas = Math.max(maxCajas, cajaCount)
          maxClams = Math.max(maxClams, clamCount)
          maxTarimas = Math.max(maxTarimas, tarimaCount)
          maxInterlocks = Math.max(maxInterlocks, interlockCount)
          maxOtros = Math.max(maxOtros, otroCount)
        }
      })
    }

    const data = receptions.map(reception => {
      const row: any = {
        "Productor": reception.producer?.code || "",
        "Almacén": reception.warehouse?.code || "",
        "Producto": reception.product?.sku || "",
        "Fecha": reception.date || "",
        "Cajas": reception.boxes || 0,
        "Peso por Caja": reception.weightPerBox || 0,
        "Peso Total": reception.totalWeight || 0,
      }

      // Agregar materiales devueltos si se solicita
      if (query.includeReturnedItems) {
        // Separar items por categoría
        const cajas: any[] = []
        const clams: any[] = []
        const tarimas: any[] = []
        const interlocks: any[] = []
        const otros: any[] = []

        if (reception.returnedItems && reception.returnedItems.length > 0) {
          reception.returnedItems.forEach((item: any) => {
            const productSku = (item.product?.sku || "").toLowerCase()
            const productName = (item.product?.name || "").toLowerCase()

            if (productSku.includes("caja") || productName.includes("caja")) {
              cajas.push(item)
            } else if (productSku.includes("clam") || productName.includes("clam")) {
              clams.push(item)
            } else if (productSku.includes("tarima") || productName.includes("tarima")) {
              tarimas.push(item)
            } else if (productSku.includes("interlock") || productName.includes("interlock")) {
              interlocks.push(item)
            } else {
              otros.push(item)
            }
          })
        }

        // Crear todas las columnas necesarias basadas en los máximos
        for (let i = 1; i <= maxCajas; i++) {
          row[`Código de Caja ${i}`] = cajas[i - 1]?.product?.sku || ""
          row[`Cantidad de Caja ${i}`] = cajas[i - 1]?.quantity || ""
        }

        for (let i = 1; i <= maxClams; i++) {
          row[`Código de Clam ${i}`] = clams[i - 1]?.product?.sku || ""
          row[`Cantidad de Clam ${i}`] = clams[i - 1]?.quantity || ""
        }

        for (let i = 1; i <= maxTarimas; i++) {
          row[`Código de Tarima ${i}`] = tarimas[i - 1]?.product?.sku || ""
          row[`Cantidad de Tarima ${i}`] = tarimas[i - 1]?.quantity || ""
        }

        for (let i = 1; i <= maxInterlocks; i++) {
          row[`Código de Interlock ${i}`] = interlocks[i - 1]?.product?.sku || ""
          row[`Cantidad de Interlock ${i}`] = interlocks[i - 1]?.quantity || ""
        }

        for (let i = 1; i <= maxOtros; i++) {
          row[`Código de Producto ${i}`] = otros[i - 1]?.product?.sku || ""
          row[`Cantidad de Producto ${i}`] = otros[i - 1]?.quantity || ""
        }
      }

      // Agregar notas al final
      if (reception.notes) {
        row["Notas"] = reception.notes
      } else {
        row["Notas"] = ""
      }

      return row
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Recepciones Fruta")

    return query.format === "csv"
      ? Buffer.from(XLSX.utils.sheet_to_csv(ws))
      : XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  }

  async generateTemplate(type: string): Promise<Buffer> {
    let data: any[] = []
    let sheetName = "Template"

    switch (type) {
      case "products":
        data = [{
          SKU: "PROD-001",
          Nombre: "Producto Ejemplo",
          Descripción: "Descripción del producto",
          Categoría: "",
          "Unidad de Medida": "u",
          "Stock Mínimo": 10,
          "Stock Máximo": 100,
        }]
        sheetName = "Productos"
        break

      case "inventory":
        data = [{
          SKU: "PROD-001",
          Almacén: "ALM-01",
          Cantidad: 100,
          Ubicación: "A-1-1",
          Lote: "LOTE-001",
          Vencimiento: "31/12/2025",
          "Precio de Costo": 0.00,
        }]
        sheetName = "Inventario"
        break

      case "suppliers":
        data = [{
          Código: "PROV-001",
          "Razón Social": "Proveedor Ejemplo S.A. de C.V.",
          RFC: "ABC123456XYZ",
          Email: "contacto@proveedor.com",
          Teléfono: "5551234567",
          Dirección: "Calle Ejemplo #123",
          "Días de Crédito": 30,
        }]
        sheetName = "Proveedores"
        break

      case "warehouses":
        data = [{
          Código: "ALM-01",
          Nombre: "Almacén Principal",
          Dirección: "Calle Principal #100",
          Teléfono: "5551234567",
          Email: "almacen@empresa.com",
        }]
        sheetName = "Almacenes"
        break

      case "movements":
        data = [{
          Fecha: "01/01/2025",
          Tipo: "entrada",
          Almacén: "ALM-01",
          SKU: "PROD-001",
          Cantidad: 50,
          "Número de Lote": "LOT-2024-001",
          "Costo Unitario": 0.00,
          Notas: "Información adicional sobre el movimiento",
        }]
        sheetName = "Movimientos"
        break

      case "input-assignments":
        data = [{
          Productor: "PROD-001 (código o nombre)",
          Almacén: "ALM-01",
          Fecha: "01/01/2025",
          SKU: "INS-001",
          Cantidad: 50,
          Notas: "Asignación de ejemplo",
        }]
        sheetName = "Asignación Insumos"
        break

      case "fruit-receptions":
        data = [{
          Productor: "PROD-001 (código o nombre)",
          Almacén: "ALM-01",
          Producto: "FRUTA-001",
          Fecha: "01/01/2025",
          Cajas: 100,
          "Peso por Caja": 18.5,
          "Peso Total": 1850,
          "Código de Caja 1": "CAJA-001",
          "Cantidad de Caja 1": 10,
          "Código de Clam 1": "CLAM-001",
          "Cantidad de Clam 1": 5,
          "Código de Tarima 1": "TARIMA-001",
          "Cantidad de Tarima 1": 2,
          "Código de Interlock 1": "INTERLOCK-001",
          "Cantidad de Interlock 1": 8,
          Notas: "Recepción de ejemplo",
        }]
        sheetName = "Recepción Fruta"
        break

      case "initial-stock":
        data = [{
          SKU: "PROD-001",
          Almacén: "ALM-01",
          "ID Almacén": "00000000-0000-0000-0000-000000000000",
          Cantidad: 100,
          Ubicación: "A-1-1",
          Lote: "LOTE-001",
          Vencimiento: "31/12/2025",
          "Precio de Costo": 0.00,
          "Stock Mínimo": 10,
          "Stock Máximo": 500,
          "Punto de Reorden": 50,
        }]
        sheetName = "Carga Inicial"
        break

      default:
        throw new BadRequestException("Template type not supported")
    }

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  }
}
