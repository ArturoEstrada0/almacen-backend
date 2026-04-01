import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSource } from 'typeorm'
import type { Request } from 'express'
import { Supplier } from "./entities/supplier.entity"
import type { CreateSupplierDto } from "./dto/create-supplier.dto"
import { TraceabilityService } from "../traceability/traceability.service"
import type { UpdateSupplierDto } from "./dto/update-supplier.dto"

@Injectable()
export class SuppliersService {
  private suppliersRepository: Repository<Supplier>
  private readonly logger = new Logger(SuppliersService.name)

  constructor(
    @InjectRepository(Supplier) suppliersRepository: Repository<Supplier>,
    private dataSource: DataSource,
    private traceabilityService: TraceabilityService,
  ) {
    this.suppliersRepository = suppliersRepository
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Map DTO fields to entity fields where names differ
    const payload: any = { ...createSupplierDto } as any
    if ((createSupplierDto as any).taxId) {
      payload.rfc = (createSupplierDto as any).taxId
      delete payload.taxId
    }
    if ((createSupplierDto as any).creditDays !== undefined) {
      payload.paymentTerms = (createSupplierDto as any).creditDays
      delete payload.creditDays
    }
    if ((createSupplierDto as any).isActive !== undefined) {
      payload.active = (createSupplierDto as any).isActive
      delete payload.isActive
    }

  // repository.create can infer array types in some cases when payload is any;
  // cast to Supplier to satisfy the compiler and preserve runtime behavior.
  const supplier = this.suppliersRepository.create(payload) as unknown as Supplier
    return await this.suppliersRepository.save(supplier)
  }

  async findAll(): Promise<Supplier[]> {
    // Avoid loading nested relations here to prevent TypeORM from trying to resolve
    // any relation names that may not exist on the entity (see EntityPropertyNotFoundError).
    // The API currently expects a flat supplier list; productSuppliers can be loaded
    // separately when needed.
    return await this.suppliersRepository.find({
      order: { name: "ASC" },
    })
  }

  async findOne(id: string): Promise<Supplier> {
    // Use findOneBy to fetch the supplier without requesting any relations. If callers
    // need relations, load them explicitly in a separate query to keep control over
    // which relations are requested.
    const supplier = await this.suppliersRepository.findOneBy({ id })

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`)
    }

    return supplier
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id)
    // Map possible DTO fields to entity fields before assigning
    const payload: any = { ...updateSupplierDto } as any
    if ((updateSupplierDto as any).taxId) {
      payload.rfc = (updateSupplierDto as any).taxId
      delete payload.taxId
    }
    if ((updateSupplierDto as any).creditDays !== undefined) {
      payload.paymentTerms = (updateSupplierDto as any).creditDays
      delete payload.creditDays
    }
    if ((updateSupplierDto as any).isActive !== undefined) {
      payload.active = (updateSupplierDto as any).isActive
      delete payload.isActive
    }

    Object.assign(supplier, payload)
    return await this.suppliersRepository.save(supplier)
  }

  async remove(id: string, req?: Request): Promise<void> {
    const supplier = await this.findOne(id)

    // Check for active purchase orders (pendiente, parcial)
    const activeOrdersRes = await this.dataSource.query(
      `SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = $1 AND status IN ('pendiente','parcial')`,
      [id],
    )
    const activeOrdersCount = Number(activeOrdersRes?.[0]?.count || 0)

    // Check for accounts payable (purchase orders not fully paid)
    const payablesRes = await this.dataSource.query(
      `SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = $1 AND (payment_status IS NULL OR payment_status != 'pagado')`,
      [id],
    )
    const payablesCount = Number(payablesRes?.[0]?.count || 0)

    const reasons: string[] = []
    if (activeOrdersCount > 0) reasons.push('El proveedor tiene órdenes de compra pendientes y no puede eliminarse.')
    if (payablesCount > 0) reasons.push('El proveedor tiene cuentas por pagar registradas y no puede eliminarse.')

    if (reasons.length > 0) {
      await this.traceabilityService.record({
        entityType: 'supplier',
        entityId: id,
        action: 'delete_attempt',
        userId: (req as any)?.user?.id || (req as any)?.user?.username || 'unknown',
        userName: (req as any)?.user?.name || (req as any)?.user?.username || 'unknown',
        reason: reasons.join(' | '),
        details: { activeOrdersCount, payablesCount },
        result: 'blocked',
      })

      throw new BadRequestException(reasons.join(' '))
    }

    // No blocking relations — proceed to delete
    await this.suppliersRepository.remove(supplier)

    await this.traceabilityService.record({
      entityType: 'supplier',
      entityId: id,
      action: 'deleted',
      userId: (req as any)?.user?.id || (req as any)?.user?.username || 'unknown',
      userName: (req as any)?.user?.name || (req as any)?.user?.username || 'unknown',
      result: 'success',
    })
  }
}
