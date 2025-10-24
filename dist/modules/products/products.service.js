"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_supplier_entity_1 = require("./entities/product-supplier.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository, productSuppliersRepository) {
        this.productsRepository = productsRepository;
        this.productSuppliersRepository = productSuppliersRepository;
    }
    async create(createProductDto) {
        const product = this.productsRepository.create(createProductDto);
        return await this.productsRepository.save(product);
    }
    async findAll(filters) {
        const query = this.productsRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.category", "category")
            .leftJoinAndSelect("product.unit", "unit")
            .leftJoinAndSelect("product.productSuppliers", "productSuppliers")
            .leftJoinAndSelect("productSuppliers.supplier", "supplier");
        if (filters?.type) {
            query.andWhere("product.type = :type", { type: filters.type });
        }
        if (filters?.categoryId) {
            query.andWhere("product.categoryId = :categoryId", { categoryId: filters.categoryId });
        }
        if (filters?.active !== undefined) {
            query.andWhere("product.active = :active", { active: filters.active });
        }
        if (filters?.search) {
            query.andWhere("(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)", {
                search: `%${filters.search}%`,
            });
        }
        return await query.getMany();
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ["category", "unit", "productSuppliers", "productSuppliers.supplier"],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productsRepository.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }
    async addSupplier(productId, supplierData) {
        const productSupplier = this.productSuppliersRepository.create({
            productId,
            ...supplierData,
        });
        return await this.productSuppliersRepository.save(productSupplier);
    }
    async getSuppliers(productId) {
        return await this.productSuppliersRepository.find({
            where: { productId },
            relations: ["supplier"],
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_supplier_entity_1.ProductSupplier)),
    __metadata("design:paramtypes", [Function, Function])
], ProductsService);
//# sourceMappingURL=products.service.js.map