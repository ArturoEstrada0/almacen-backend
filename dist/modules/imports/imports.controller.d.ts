import { ImportsService } from "./imports.service";
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    importFile(file: any, mapping: string, type: string, sheetName?: string): Promise<{
        processed: number;
        success: number;
        errors: any[];
    }>;
}
