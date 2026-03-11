import { Injectable, Logger } from '@nestjs/common'
import { ProductsService } from '../products/products.service'
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service'
import { XMLParser } from 'fast-xml-parser'

@Injectable()
export class InvoiceImportService {
  private readonly logger = new Logger(InvoiceImportService.name)
  constructor(private productsService: ProductsService, private purchaseOrdersService: PurchaseOrdersService) {}

  async parseXmlBuffer(buffer: Buffer) {
    const xml = buffer.toString('utf8')
    const options: any = {
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: 'text',
      parseAttributeValue: false,
      parseNodeValue: false,
      trimValues: true,
      // Forzar array para elementos de concepto, incluso si solo hay uno
      isArray: (name: string) => /concepto|concept|linea|detalle|item|producto/i.test(name),
    }

    const parser = new XMLParser(options)
    const obj = parser.parse(xml)

    // Buscar nodos de concepto/linea comunes (por atributos o por nombre de elemento)
    const concepts: any[] = []

    /** Comprueba si un objeto parece un concepto de factura */
    function looksLikeConcept(item: any): boolean {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return false
      const keys = Object.keys(item)
      const hasDesc = keys.some((x) => /descripcion|description|concepto|detalle|nombre|producto/i.test(x))
      const hasQty  = keys.some((x) => /cantidad|quantity|cant\b|qty/i.test(x))
      const hasPrice = keys.some((x) => /valorunitario|unitprice|precio|price|importe/i.test(x))
      return (hasDesc || hasQty) && (hasQty || hasPrice)
    }

    function walk(node: any) {
      if (!node || typeof node !== 'object') return
      for (const k of Object.keys(node)) {
        const v = node[k]
        if (Array.isArray(v)) {
          for (const item of v) {
            if (looksLikeConcept(item)) concepts.push(item)
            walk(item)
          }
        } else if (typeof v === 'object') {
          // Concepto singular que no quedó como array
          if (looksLikeConcept(v)) concepts.push(v)
          walk(v)
        }
      }
    }

    walk(obj)

    // Recopilar todas las claves únicas de los conceptos (para mapeo de columnas en frontend)
    const rawKeySet = new Set<string>()
    concepts.forEach((c) => Object.keys(c).forEach((k) => rawKeySet.add(k)))
    const rawKeys = Array.from(rawKeySet)

    const lines = await Promise.all(
      concepts.map(async (c: any) => {
        const description = c.Descripcion || c.descripcion || c.Description || c.description || c.text || ''
        const quantity = Number(c.Cantidad || c.cantidad || c.Quantity || c.quantity || 1)
        const unitPrice = Number(c.ValorUnitario || c.ValorUnitario || c.UnitPrice || c.unitPrice || c.Precio || c.PrecioUnitario || 0)
        const productCode = c.ClaveProdServ || c.NoIdentificacion || c.noIdentificacion || c.sku || c.Codigo || null

        // 1) Buscar por código exacto primero
        let suggestions: any[] = []
        try {
          if (productCode) {
            suggestions = await this.productsService.findAll({ search: String(productCode) })
          }
          // 2) Si no hubo coincidencia por código, intentar por palabras clave de la descripción
          if (suggestions.length === 0 && description) {
            const words = String(description)
              .split(/[\s,\-\/]+/)
              .map((w) => w.trim())
              .filter((w) => w.length >= 3)
            for (const word of words.slice(0, 4)) {
              const partial = await this.productsService.findAll({ search: word })
              suggestions.push(...partial)
              if (suggestions.length >= 10) break
            }
            // Deduplicar por id
            const seen = new Set<string>()
            suggestions = suggestions.filter((s) => {
              if (seen.has(s.id)) return false
              seen.add(s.id)
              return true
            })
          }
        } catch (e) {
          this.logger.debug(`Product search failed for "${productCode || description}": ${e}`)
        }

        return {
          description,
          quantity,
          unitPrice,
          productCode,
          rawData: c,           // atributos originales del XML para remapeo
          suggestions: (suggestions || []).slice(0, 10),
        }
      }),
    )

    return { lines, rawKeys }
  }

  async createPurchaseFromMapping(payload: any) {
    // Expected payload to match CreatePurchaseOrderDto shape
    // Delegate to purchaseOrdersService.create which performs validation and transaction
    return await this.purchaseOrdersService.create(payload)
  }
}
