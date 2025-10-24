import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(type?: 'insumo' | 'fruta', categoryId?: string, active?: boolean, search?: string): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<void>;
    addSupplier(productId: string, supplierData: any): Promise<import("./entities/product-supplier.entity").ProductSupplier>;
    getSuppliers(productId: string): Promise<import("./entities/product-supplier.entity").ProductSupplier[]>;
}
