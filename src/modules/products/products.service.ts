import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Product } from "./entities/product.entity"
import { ProductSupplier } from "./entities/product-supplier.entity"
import { InventoryItem } from "../inventory/entities/inventory-item.entity"
import type { CreateProductDto } from "./dto/create-product.dto"
import type { UpdateProductDto } from "./dto/update-product.dto"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductSupplier)
    private productSuppliersRepository: Repository<ProductSupplier>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Validar que el SKU no exista antes de intentar crear
      const existingProduct = await this.productsRepository.findOne({
        where: { sku: createProductDto.sku },
      })

      if (existingProduct) {
        throw new ConflictException(`Ya existe un producto con el SKU "${createProductDto.sku}". Por favor, utilice un SKU diferente.`)
      }

      const product = this.productsRepository.create(createProductDto)
      return await this.productsRepository.save(product)
    } catch (error) {
      // Re-lanzar excepciones conocidas de NestJS
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error
      }
      // Para otros errores, el filtro global los manejará
      throw error
    }
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
      throw new NotFoundException(`No se encontró el producto solicitado.`)
    }

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    try {
      const product = await this.findOne(id)
      
      // Si se está actualizando el SKU, verificar que no exista otro producto con ese SKU
      if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
        const existingProduct = await this.productsRepository.findOne({
          where: { sku: updateProductDto.sku },
        })

        if (existingProduct) {
          throw new ConflictException(`Ya existe un producto con el SKU "${updateProductDto.sku}". Por favor, utilice un SKU diferente.`)
        }
      }
      
      // Extraer currentStock y warehouseId antes de asignar al producto
      const { currentStock, warehouseId, ...productData } = updateProductDto
      
      Object.assign(product, productData)
      const updatedProduct = await this.productsRepository.save(product)
      
      // Si se proporciona currentStock, actualizar el inventario
      if (currentStock !== undefined && warehouseId) {
        let inventoryItem = await this.inventoryRepository.findOne({
          where: { productId: id, warehouseId },
        })
        
        if (!inventoryItem) {
          // Crear nuevo registro de inventario si no existe
          inventoryItem = this.inventoryRepository.create({
            productId: id,
            warehouseId,
            quantity: currentStock,
            minStock: 0,
            maxStock: 1000,
            reorderPoint: 0,
          })
        } else {
          inventoryItem.quantity = currentStock
        }
        
        await this.inventoryRepository.save(inventoryItem)
      }
      
      return updatedProduct
    } catch (error) {
      // Re-lanzar excepciones conocidas de NestJS
      if (error instanceof ConflictException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      // Para otros errores, el filtro global los manejará
      throw error
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id)
    
    // Verificar si el producto está siendo utilizado en otras partes del sistema
    const inventoryCount = await this.inventoryRepository.count({
      where: { productId: id },
    })
    
    if (inventoryCount > 0) {
      throw new ConflictException('No se puede eliminar el producto porque tiene registros de inventario asociados. Por favor, elimine primero los registros de inventario.')
    }
    
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
