import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { EntityManager, Repository } from "typeorm"
import { ShipmentAccountingEntry } from "./entities/shipment-accounting-entry.entity"
import { Shipment } from "../producers/entities/shipment.entity"
import { RegisterShipmentPayableDto } from "./dto/register-shipment-payable.dto"

export interface ShipmentAccountingPayload {
  shipmentId: string
  shipmentCode: string
  customer?: {
    id?: string | null
    name?: string | null
  } | null
  carrier?: {
    id?: string | null
    name?: string | null
  } | null
  customerAmount?: number | null
  carrierAmount?: number | null
  customerDocumentUrl?: string | null
  carrierDocumentUrl?: string | null
  customerDocumentRegisteredAt?: Date | null
  carrierDocumentRegisteredAt?: Date | null
  customerReferenceNumber?: string | null
  carrierReferenceNumber?: string | null
}

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(ShipmentAccountingEntry)
    private readonly shipmentAccountingRepository: Repository<ShipmentAccountingEntry>,
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
  ) {}

  private normalizeAmount(amount?: number | null): number {
    const value = Number(amount || 0)
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0
  }

  async syncShipmentEntries(manager: EntityManager, payload: ShipmentAccountingPayload): Promise<ShipmentAccountingEntry[]> {
    const repository = manager.getRepository(ShipmentAccountingEntry)
    const savedEntries: ShipmentAccountingEntry[] = []

    const upsertEntry = async (params: {
      entryType: "cuenta_por_cobrar" | "cuenta_por_pagar"
      partyType: "customer" | "carrier"
      partyId?: string | null
      partyName?: string | null
      amount?: number | null
      documentType?: string | null
      documentUrl?: string | null
      documentRegisteredAt?: Date | null
      referenceNumber?: string | null
      description: string
    }) => {
      const normalizedAmount = this.normalizeAmount(params.amount)
      const existing = await repository.findOne({
        where: {
          shipmentId: payload.shipmentId,
          entryType: params.entryType,
          partyType: params.partyType,
        },
      })

      // If the amount is no longer valid, remove the previous accounting entry to keep the ledger aligned.
      if (normalizedAmount <= 0 || !params.partyName) {
        if (existing) {
          await repository.remove(existing)
        }
        return null
      }

      const baseData = {
        shipmentId: payload.shipmentId,
        shipmentCode: payload.shipmentCode,
        entryType: params.entryType,
        partyType: params.partyType,
        partyId: params.partyId || null,
        partyName: params.partyName,
        amount: normalizedAmount,
        description: params.description,
        documentType: params.documentType || null,
        documentUrl: params.documentUrl || null,
        documentRegisteredAt: params.documentRegisteredAt || null,
        referenceNumber: params.referenceNumber || null,
        paidAmount: existing ? Number(existing.paidAmount || 0) : 0,
        paymentStatus: existing ? existing.paymentStatus : "pendiente",
        lastPaymentAt: existing ? existing.lastPaymentAt || null : null,
        lastPaymentMethod: existing ? existing.lastPaymentMethod || null : null,
        lastPaymentReference: existing ? existing.lastPaymentReference || null : null,
        lastPaymentNotes: existing ? existing.lastPaymentNotes || null : null,
        metadata: {
          shipmentId: payload.shipmentId,
          shipmentCode: payload.shipmentCode,
          partyType: params.partyType,
          entryType: params.entryType,
        },
      }

      const entry = existing ? repository.merge(existing, baseData) : repository.create(baseData)
      await repository.save(entry)
      return entry
    }

    const customerEntry = await upsertEntry({
      entryType: "cuenta_por_cobrar",
      partyType: "customer",
      partyId: payload.customer?.id || null,
      partyName: payload.customer?.name || null,
      amount: payload.customerAmount || 0,
      documentType: "factura_cliente",
      documentUrl: payload.customerDocumentUrl || null,
      documentRegisteredAt: payload.customerDocumentRegisteredAt || null,
      referenceNumber: payload.customerReferenceNumber || payload.shipmentCode,
      description: `Cuenta por cobrar del viaje ${payload.shipmentCode}${payload.customer?.name ? ` - Cliente: ${payload.customer.name}` : ""}`,
    })
    if (customerEntry) savedEntries.push(customerEntry)

    const carrierEntry = await upsertEntry({
      entryType: "cuenta_por_pagar",
      partyType: "carrier",
      partyId: payload.carrier?.id || null,
      partyName: payload.carrier?.name || null,
      amount: payload.carrierAmount || 0,
      documentType: "factura_transportista",
      documentUrl: payload.carrierDocumentUrl || null,
      documentRegisteredAt: payload.carrierDocumentRegisteredAt || null,
      referenceNumber: payload.carrierReferenceNumber || payload.shipmentCode,
      description: `Cuenta por pagar del viaje ${payload.shipmentCode}${payload.carrier?.name ? ` - Transportista: ${payload.carrier.name}` : ""}`,
    })
    if (carrierEntry) savedEntries.push(carrierEntry)

    return savedEntries
  }

  async findByShipment(manager: EntityManager, shipmentId: string): Promise<ShipmentAccountingEntry[]> {
    return manager.getRepository(ShipmentAccountingEntry).find({
      where: { shipmentId },
      order: { createdAt: "ASC" },
    })
  }

  async findShipmentPayables() {
    const entries = await this.shipmentAccountingRepository.find({
      where: { entryType: "cuenta_por_pagar" as any },
      order: { createdAt: "DESC" },
    })

    const shipmentIds = [...new Set(entries.map((entry) => entry.shipmentId).filter(Boolean))]
    const shipments = shipmentIds.length
      ? await this.shipmentsRepository.find({ where: shipmentIds.map((id) => ({ id })) as any })
      : []
    const shipmentsMap = new Map(shipments.map((shipment) => [shipment.id, shipment]))

    return entries.map((entry) => {
      const shipment = shipmentsMap.get(entry.shipmentId)
      const amount = Number(entry.amount || 0)
      const paidAmount = Number(entry.paidAmount || 0)
      const pendingAmount = Math.max(amount - paidAmount, 0)
      const documents = [
        { label: "Factura de transportista", url: entry.documentUrl || shipment?.carrierInvoiceUrl || null },
        { label: "Factura de cliente", url: shipment?.invoiceUrl || null },
        { label: "Carta porte", url: shipment?.waybillUrl || null },
      ].filter((doc) => !!doc.url)

      return {
        ...entry,
        amount,
        paidAmount,
        pendingAmount,
        paymentStatus: entry.paymentStatus || (pendingAmount <= 0 ? "pagado" : paidAmount > 0 ? "parcial" : "pendiente"),
        shipmentDate: shipment?.date || null,
        trackingFolio: shipment?.trackingFolio || null,
        documents,
      }
    })
  }

  async registerShipmentPayablePayment(id: string, dto: RegisterShipmentPayableDto) {
    const entry = await this.shipmentAccountingRepository.findOne({ where: { id } })
    if (!entry) {
      throw new NotFoundException(`No se encontró la cuenta por pagar del embarque ${id}`)
    }
    if (entry.entryType !== "cuenta_por_pagar") {
      throw new BadRequestException("Solo se pueden registrar pagos para cuentas por pagar")
    }

    const paymentAmount = this.normalizeAmount(dto.amount)
    if (paymentAmount <= 0) {
      throw new BadRequestException("El monto del pago debe ser mayor a 0")
    }

    const total = this.normalizeAmount(entry.amount)
    const currentPaid = this.normalizeAmount(entry.paidAmount)
    const newPaid = this.normalizeAmount(currentPaid + paymentAmount)

    if (newPaid > total) {
      throw new BadRequestException(`El pago excede el saldo pendiente (${(total - currentPaid).toFixed(2)})`)
    }

    entry.paidAmount = newPaid
    entry.paymentStatus = newPaid >= total ? "pagado" : newPaid > 0 ? "parcial" : "pendiente"
    entry.lastPaymentAt = new Date()
    entry.lastPaymentMethod = dto.paymentMethod || null
    entry.lastPaymentReference = dto.reference || null
    entry.lastPaymentNotes = dto.notes || null

    const currentMetadata = (entry.metadata || {}) as Record<string, any>
    const existingPayments = Array.isArray(currentMetadata.payments) ? currentMetadata.payments : []
    entry.metadata = {
      ...currentMetadata,
      payments: [
        ...existingPayments,
        {
          amount: paymentAmount,
          paymentMethod: dto.paymentMethod || null,
          reference: dto.reference || null,
          notes: dto.notes || null,
          paidAt: entry.lastPaymentAt.toISOString(),
        },
      ],
    }

    await this.shipmentAccountingRepository.save(entry)
    return entry
  }
}
