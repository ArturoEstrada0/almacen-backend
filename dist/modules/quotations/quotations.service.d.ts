import type { Repository } from "typeorm";
import { Quotation } from "./entities/quotation.entity";
import { QuotationItem } from "./entities/quotation-item.entity";
import type { CreateQuotationDto } from "./dto/create-quotation.dto";
export declare class QuotationsService {
    private quotationsRepository;
    private quotationItemsRepository;
    constructor(quotationsRepository: Repository<Quotation>, quotationItemsRepository: Repository<QuotationItem>);
    create(createQuotationDto: CreateQuotationDto): Promise<Quotation>;
    findAll(): Promise<Quotation[]>;
    findOne(id: string): Promise<Quotation>;
    markAsWinner(quotationId: string, supplierId: string): Promise<Quotation>;
}
