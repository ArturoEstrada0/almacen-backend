"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quotation_entity_1 = require("./entities/quotation.entity");
const quotation_item_entity_1 = require("./entities/quotation-item.entity");
let QuotationsService = class QuotationsService {
    constructor(quotationsRepository, quotationItemsRepository) {
        this.quotationsRepository = quotationsRepository;
        this.quotationItemsRepository = quotationItemsRepository;
    }
    async create(createQuotationDto) {
        const quotation = this.quotationsRepository.create({
            description: createQuotationDto.description,
            validUntil: createQuotationDto.validUntil,
            status: "pendiente",
        });
        await this.quotationsRepository.save(quotation);
        for (const itemDto of createQuotationDto.items) {
            const item = this.quotationItemsRepository.create({
                quotationId: quotation.id,
                productId: itemDto.productId,
                quantity: itemDto.quantity,
            });
            await this.quotationItemsRepository.save(item);
        }
        return await this.findOne(quotation.id);
    }
    async findAll() {
        return await this.quotationsRepository.find({
            relations: ["items", "items.product"],
            order: { createdAt: "DESC" },
        });
    }
    async findOne(id) {
        const quotation = await this.quotationsRepository.findOne({
            where: { id },
            relations: ["items", "items.product", "items.supplierResponses", "items.supplierResponses.supplier"],
        });
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with ID ${id} not found`);
        }
        return quotation;
    }
    async markAsWinner(quotationId, supplierId) {
        const quotation = await this.findOne(quotationId);
        quotation.status = "aceptada";
        quotation.winningSupplierId = supplierId;
        await this.quotationsRepository.save(quotation);
        return quotation;
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quotation_entity_1.Quotation)),
    __param(1, (0, typeorm_1.InjectRepository)(quotation_item_entity_1.QuotationItem)),
    __metadata("design:paramtypes", [Function, Function])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map