export declare class CreateQuotationItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateQuotationDto {
    description?: string;
    validUntil?: Date;
    items: CreateQuotationItemDto[];
}
