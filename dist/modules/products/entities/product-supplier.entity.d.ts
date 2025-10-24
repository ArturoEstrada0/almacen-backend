import { Product } from "./product.entity";
import { Supplier } from "../../suppliers/entities/supplier.entity";
export declare class ProductSupplier {
    id: string;
    productId: string;
    product: Product;
    supplierId: string;
    supplier: Supplier;
    price: number;
    supplierSku: string;
    leadTimeDays: number;
    minimumOrder: number;
    preferred: boolean;
    createdAt: Date;
    updatedAt: Date;
}
