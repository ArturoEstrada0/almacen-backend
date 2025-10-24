import { Quotation } from "./quotation.entity";
import { Product } from "../../products/entities/product.entity";
export declare class QuotationItem {
    id: string;
    quotationId: string;
    quotation: Quotation;
    productId: string;
    product: Product;
    quantity: number;
    price: number;
    total: number;
    notes: string;
}
