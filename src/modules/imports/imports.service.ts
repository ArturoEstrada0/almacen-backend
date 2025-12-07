import { Injectable, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Between } from "typeorm"
import * as XLSX from "xlsx"
import { ProductsService } from "../products/products.service"
import { WarehousesService } from "../warehouses/warehouses.service"
import { Product } from "../products/entities/product.entity"
import { InventoryItem } from "../inventory/entities/inventory-item.entity"
import { Movement } from "../inventory/entities/movement.entity"
import { Supplier } from "../suppliers/entities/supplier.entity"
import type { ExportProductsDto, ExportInventoryDto, ExportMovementsDto, ExportSuppliersDto } from "./dto/export-query.dto"

@Injectable()
export class ImportsService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly warehousesService: WarehousesService,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Movement)
    private readonly movementsRepository: Repository<Movement>,
    @InjectRepository(Supplier)
    private readonly suppliersRepository: Repository<Supplier>,
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
          Producto: item.product?.name || "",
          Cantidad: item.quantity,
          Código: mov.code || "",
          Notas: mov.notes || "",
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
          Producto: "Producto Ejemplo",
          Cantidad: 50,
          Código: "MOV-001",
          Notas: "Nota de ejemplo",
        }]
        sheetName = "Movimientos"
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
