import { PurchaseOrder } from "./purchase-order.entity";
import { Product } from "../../products/entities/product.entity";
export declare class PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    purchaseOrder: PurchaseOrder;
    productId: string;
    product: Product;
    quantity: number;
    receivedQuantity: number;
    price: number;
    total: number;
    notes: string;
}
