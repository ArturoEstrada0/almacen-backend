import { ProductSupplier } from "../../products/entities/product-supplier.entity";
import { Quotation } from "../../quotations/entities/quotation.entity";
export declare class Supplier {
    id: string;
    name: string;
    code: string;
    rfc: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
    contactName: string;
    businessType: string;
    paymentTerms: number;
    active: boolean;
    productSuppliers: ProductSupplier[];
    quotations: Quotation[];
    createdAt: Date;
    updatedAt: Date;
}
