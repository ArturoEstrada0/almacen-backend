import { Injectable, BadRequestException } from "@nestjs/common"
import * as XLSX from "xlsx"
import { ProductsService } from "../products/products.service"
import { WarehousesService } from "../warehouses/warehouses.service"

@Injectable()
export class ImportsService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly warehousesService: WarehousesService,
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
          // mapping: field -> columnName
          // map known fields
          const skuCol = mapping['sku']
          const nameCol = mapping['name']
          if (!skuCol || !nameCol) throw new Error('SKU or Name mapping missing')

          const sku = row[headers.indexOf(skuCol)] ?? ''
          const name = row[headers.indexOf(nameCol)] ?? ''
          if (!sku || !name) throw new Error('SKU or Name empty')

          dto.sku = String(sku).trim()
          dto.name = String(name).trim()
          if (mapping['description']) dto.description = String(row[headers.indexOf(mapping['description'])] ?? '').trim()
          // Prices are stored in almacén and should not be imported here. Ignore cost/sale price mappings.

          await this.productsService.create(dto)
          result.success++
        } else if (type === 'warehouses' || type === 'warehouses' ) {
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
}
