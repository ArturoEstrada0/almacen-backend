export declare class CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    type: "insumo" | "fruta";
    cost?: number;
    price?: number;
    image?: string;
    barcode?: string;
    categoryId?: string;
    unitId?: string;
    active?: boolean;
}
