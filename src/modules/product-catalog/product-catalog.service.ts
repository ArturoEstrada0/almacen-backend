import { ConflictException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { ILike, Repository } from "typeorm"
import {
  ProductCatalogItem,
  ProductCatalogItemStatus,
  ProductCatalogItemType,
} from "./entities/product-catalog-item.entity"
import { CreateProductCatalogItemDto } from "./dto/create-product-catalog-item.dto"
import { UpdateProductCatalogItemDto } from "./dto/update-product-catalog-item.dto"

export interface ProductCatalogFilters {
  type?: ProductCatalogItemType
  status?: ProductCatalogItemStatus
  search?: string
}

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(ProductCatalogItem)
    private readonly catalogRepository: Repository<ProductCatalogItem>,
  ) {}

  async findAll(filters?: ProductCatalogFilters): Promise<ProductCatalogItem[]> {
    const query = this.catalogRepository.createQueryBuilder("item")

    if (filters?.type) {
      query.andWhere("item.type = :type", { type: filters.type })
    }

    if (filters?.status) {
      query.andWhere("item.status = :status", { status: filters.status })
    }

    if (filters?.search) {
      query.andWhere("LOWER(item.name) LIKE LOWER(:search)", { search: `%${filters.search.trim()}%` })
    }

    query.orderBy("item.name", "ASC")
    query.addOrderBy("item.createdAt", "ASC")

    return query.getMany()
  }

  async findActive(type?: ProductCatalogItemType): Promise<ProductCatalogItem[]> {
    return this.findAll({ type, status: "active" })
  }

  async findOne(id: string): Promise<ProductCatalogItem> {
    const item = await this.catalogRepository.findOne({ where: { id } })
    if (!item) {
      throw new NotFoundException("No se encontró el registro solicitado.")
    }
    return item
  }

  async create(dto: CreateProductCatalogItemDto): Promise<ProductCatalogItem> {
    const name = dto.name.trim()
    const type = dto.type

    await this.ensureUniqueNameType(name, type)

    const item = this.catalogRepository.create({
      name,
      description: dto.description?.trim() || null,
      type,
      status: dto.status || "active",
    })

    return this.catalogRepository.save(item)
  }

  async update(id: string, dto: UpdateProductCatalogItemDto): Promise<ProductCatalogItem> {
    const item = await this.findOne(id)
    const nextName = dto.name !== undefined ? dto.name.trim() : item.name
    const nextType = dto.type !== undefined ? dto.type : item.type

    if (dto.name !== undefined || dto.type !== undefined) {
      await this.ensureUniqueNameType(nextName, nextType, id)
    }

    if (dto.name !== undefined) item.name = nextName
    if (dto.description !== undefined) item.description = dto.description?.trim() || null
    if (dto.type !== undefined) item.type = dto.type
    if (dto.status !== undefined) item.status = dto.status

    return this.catalogRepository.save(item)
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id)
    await this.catalogRepository.remove(item)
  }

  private async ensureUniqueNameType(name: string, type: ProductCatalogItemType, excludeId?: string) {
    const query = this.catalogRepository
      .createQueryBuilder("item")
      .where("LOWER(item.name) = LOWER(:name)", { name: name.trim() })
      .andWhere("item.type = :type", { type })

    if (excludeId) {
      query.andWhere("item.id != :excludeId", { excludeId })
    }

    const existing = await query.getOne()
    if (existing) {
      throw new ConflictException("Ya existe un registro con ese nombre dentro del mismo tipo.")
    }
  }
}