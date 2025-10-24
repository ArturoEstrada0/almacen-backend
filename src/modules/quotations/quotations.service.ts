import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Quotation } from "./entities/quotation.entity"
import { QuotationItem } from "./entities/quotation-item.entity"
import type { CreateQuotationDto } from "./dto/create-quotation.dto"

@Injectable()
export class QuotationsService {
  private quotationsRepository: Repository<Quotation>
  private quotationItemsRepository: Repository<QuotationItem>

  constructor(
    @InjectRepository(Quotation)
    quotationsRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    quotationItemsRepository: Repository<QuotationItem>,
  ) {
    this.quotationsRepository = quotationsRepository
    this.quotationItemsRepository = quotationItemsRepository
  }

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    const quotation = this.quotationsRepository.create({
      description: createQuotationDto.description,
      validUntil: createQuotationDto.validUntil,
      status: "pendiente",
    } as any)
    await this.quotationsRepository.save(quotation as any)

    for (const itemDto of createQuotationDto.items) {
      const item = this.quotationItemsRepository.create({
        quotationId: (quotation as any).id,
        productId: itemDto.productId,
        quantity: itemDto.quantity,
      } as any)
      await this.quotationItemsRepository.save(item as any)
    }

  return await this.findOne((quotation as any).id)
  }

  async findAll(): Promise<Quotation[]> {
    return await this.quotationsRepository.find({
      relations: ["items", "items.product"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "items.supplierResponses", "items.supplierResponses.supplier"],
    })

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`)
    }

    return quotation
  }

  async markAsWinner(quotationId: string, supplierId: string): Promise<Quotation> {
    const quotation = await this.findOne(quotationId)
  quotation.status = "aceptada" as any
  ;(quotation as any).winningSupplierId = supplierId
  await this.quotationsRepository.save(quotation as any)
    return quotation
  }
}
