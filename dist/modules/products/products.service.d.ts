import type { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { ProductSupplier } from "./entities/product-supplier.entity";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";
export declare class ProductsService {
    private productsRepository;
    private productSuppliersRepository;
    constructor(productsRepository: Repository<Product>, productSuppliersRepository: Repository<ProductSupplier>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(filters?: {
        type?: "insumo" | "fruta";
        categoryId?: string;
        active?: boolean;
        search?: string;
    }): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
    addSupplier(productId: string, supplierData: any): Promise<ProductSupplier>;
    getSuppliers(productId: string): Promise<ProductSupplier[]>;
}
