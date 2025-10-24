import { QuotationsService } from "./quotations.service";
import { CreateQuotationDto } from "./dto/create-quotation.dto";
export declare class QuotationsController {
    private readonly quotationsService;
    constructor(quotationsService: QuotationsService);
    create(createQuotationDto: CreateQuotationDto): Promise<import("./entities/quotation.entity").Quotation>;
    findAll(): Promise<import("./entities/quotation.entity").Quotation[]>;
    findOne(id: string): Promise<import("./entities/quotation.entity").Quotation>;
    markAsWinner(id: string, supplierId: string): Promise<import("./entities/quotation.entity").Quotation>;
}
