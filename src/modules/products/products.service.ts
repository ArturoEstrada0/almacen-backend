import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import { ProductSupplier } from "./entities/product-supplier.entity"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductSupplier)
    private productSuppliersRepository: Repository<ProductSupplier>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto)
    return await this.productsRepository.save(product)
  }

  async findAll(filters?: {
    type?: "insumo" | "fruta"
    categoryId?: string
    active?: boolean
    search?: string
  }): Promise<Product[]> {
    const query = this.productsRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.unit", "unit")
      .leftJoinAndSelect("product.productSuppliers", "productSuppliers")
      .leftJoinAndSelect("productSuppliers.supplier", "supplier")

    if (filters?.type) {
      query.andWhere("product.type = :type", { type: filters.type })
    }

    if (filters?.categoryId) {
      query.andWhere("product.categoryId = :categoryId", { categoryId: filters.categoryId })
    }

    if (filters?.active !== undefined) {
      query.andWhere("product.active = :active", { active: filters.active })
    }

    if (filters?.search) {
      query.andWhere("(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)", {
        search: `%${filters.search}%`,
      })
    }

  // Ordenar primero por SKU (ASC) y luego por nombre (A-Z)
  // Prioriza SKU para determinismo cuando existan varios productos con el mismo nombre.
  query.orderBy("product.sku", "ASC")
  query.addOrderBy("product.name", "ASC")

    return await query.getMany()
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ["category", "unit", "productSuppliers", "productSuppliers.supplier"],
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id)
    Object.assign(product, updateProductDto)
    return await this.productsRepository.save(product)
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    await this.productsRepository.remove(product)
  }

  async addSupplier(productId: string, supplierData: any): Promise<ProductSupplier> {
    const productSupplier = this.productSuppliersRepository.create({
      productId,
      ...supplierData,
    } as any)
    return await this.productSuppliersRepository.save(productSupplier as any)
  }

  async getSuppliers(productId: string): Promise<ProductSupplier[]> {
    return await this.productSuppliersRepository.find({
      where: { productId },
      relations: ["supplier"],
    })
  }
}
