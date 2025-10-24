import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Supplier } from "./entities/supplier.entity"
import type { CreateSupplierDto } from "./dto/create-supplier.dto"
import type { UpdateSupplierDto } from "./dto/update-supplier.dto"

@Injectable()
export class SuppliersService {
  private suppliersRepository: Repository<Supplier>

  constructor(@InjectRepository(Supplier) suppliersRepository: Repository<Supplier>) {
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

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id)
    await this.suppliersRepository.remove(supplier)
  }
}
