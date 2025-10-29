import { ProductsService } from "../products/products.service";
import { WarehousesService } from "../warehouses/warehouses.service";
export declare class ImportsService {
    private readonly productsService;
    private readonly warehousesService;
    constructor(productsService: ProductsService, warehousesService: WarehousesService);
    importFile(buffer: Buffer, mapping: Record<string, string>, type: string, sheetName?: string): Promise<{
        processed: number;
        success: number;
        errors: any[];
    }>;
}
