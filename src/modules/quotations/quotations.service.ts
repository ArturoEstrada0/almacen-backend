import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { randomUUID } from 'crypto';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { QuotationSupplierToken } from './entities/quotation-supplier-token.entity';
import { QuotationSupplierResponse } from './entities/quotation-supplier-response.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Product } from '../products/entities/product.entity';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { SubmitSupplierResponseDto } from './dto/submit-supplier-response.dto';
import { MailService, QuotationEmailData } from '../mail/mail.service';

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private quotationItemsRepository: Repository<QuotationItem>,
    @InjectRepository(QuotationSupplierToken)
    private supplierTokensRepository: Repository<QuotationSupplierToken>,
    @InjectRepository(QuotationSupplierResponse)
    private supplierResponsesRepository: Repository<QuotationSupplierResponse>,
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private mailService: MailService,
  ) {}

  private async generateQuotationCode(): Promise<string> {
    const year = new Date().getFullYear();
    const lastQuotation = await this.quotationsRepository
      .createQueryBuilder('q')
      .where('q.code LIKE :pattern', { pattern: `COT-${year}-%` })
      .orderBy('q.created_at', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastQuotation) {
      const lastNumber = parseInt(lastQuotation.code.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `COT-${year}-${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    // Validar que los proveedores existan y tengan email
    const suppliers = await this.suppliersRepository.find({
      where: { id: In(createQuotationDto.supplierIds) },
    });

    if (suppliers.length !== createQuotationDto.supplierIds.length) {
      throw new BadRequestException('Uno o más proveedores no existen');
    }

    const suppliersWithoutEmail = suppliers.filter((s) => !s.email);
    if (suppliersWithoutEmail.length > 0) {
      throw new BadRequestException(
        `Los siguientes proveedores no tienen email configurado: ${suppliersWithoutEmail.map((s) => s.name).join(', ')}`,
      );
    }

    // Validar que los productos existan
    const productIds = createQuotationDto.items.map((item) => item.productId);
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(`Uno o más productos no existen. IDs no encontrados: ${missingIds.join(', ')}`);
    }

    // Crear la cotización
    const code = await this.generateQuotationCode();
    const quotation = this.quotationsRepository.create({
      code,
      description: createQuotationDto.description,
      date: new Date(),
      validUntil: new Date(createQuotationDto.validUntil),
      notes: createQuotationDto.notes,
      status: 'borrador',
    });

    await this.quotationsRepository.save(quotation);

    // Crear los items de la cotización
    for (const itemDto of createQuotationDto.items) {
      const item = this.quotationItemsRepository.create({
        quotationId: quotation.id,
        productId: itemDto.productId,
        quantity: itemDto.quantity,
        notes: itemDto.notes,
      });
      await this.quotationItemsRepository.save(item);
    }

    // Crear tokens para cada proveedor
    const tokenExpiration = new Date(createQuotationDto.validUntil);
    tokenExpiration.setDate(tokenExpiration.getDate() + 7); // 7 días extra después de válido

    for (const supplier of suppliers) {
      const token = this.supplierTokensRepository.create({
        quotationId: quotation.id,
        supplierId: supplier.id,
        token: randomUUID(),
        expiresAt: tokenExpiration,
      });
      await this.supplierTokensRepository.save(token);
    }

    // Enviar correos automáticamente a todos los proveedores
    try {
      await this.sendEmailToSuppliers(quotation.id);
    } catch (error) {
      console.error('Error enviando correos automáticamente:', error);
      // No fallar si los correos no se envían, la cotización ya fue creada
    }

    return this.findOne(quotation.id);
  }

  async findAll(): Promise<Quotation[]> {
    return this.quotationsRepository.find({
      relations: [
        'items',
        'items.product',
        'items.product.unit',
        'items.supplierResponses',
        'items.supplierResponses.supplier',
        'supplierTokens',
        'supplierTokens.supplier',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'items.product.unit',
        'items.supplierResponses',
        'items.supplierResponses.supplier',
        'supplierTokens',
        'supplierTokens.supplier',
      ],
    });

    if (!quotation) {
      throw new NotFoundException(`Cotización con ID ${id} no encontrada`);
    }

    return quotation;
  }

  async sendEmailToSuppliers(quotationId: string, supplierIds?: string[]): Promise<{ sent: string[]; failed: string[] }> {
    const quotation = await this.findOne(quotationId);

    if (!quotation.supplierTokens || quotation.supplierTokens.length === 0) {
      throw new BadRequestException('No hay proveedores asignados a esta cotización');
    }

    // Filtrar tokens por proveedores específicos si se proporcionan
    let tokens = quotation.supplierTokens;
    if (supplierIds && supplierIds.length > 0) {
      tokens = tokens.filter((t) => supplierIds.includes(t.supplierId));
    }

    const sent: string[] = [];
    const failed: string[] = [];

    for (const tokenRecord of tokens) {
      try {
        const supplier = tokenRecord.supplier;
        if (!supplier.email) {
          failed.push(`${supplier.name} (sin email)`);
          continue;
        }

        const emailData: QuotationEmailData = {
          supplierName: supplier.contactName || supplier.name,
          supplierEmail: supplier.email,
          quotationCode: quotation.code,
          quotationId: quotation.id,
          accessToken: tokenRecord.token,
          validUntil: quotation.validUntil,
          items: quotation.items.map((item) => ({
            productName: item.product.name,
            productCode: item.product.sku,
            quantity: Number(item.quantity),
            unit: (item.product.unit as any)?.abbreviation || 'pz',
          })),
          notes: quotation.notes,
        };

        await this.mailService.sendQuotationRequest(emailData);

        // Actualizar el registro del token
        tokenRecord.emailSent = true;
        tokenRecord.emailSentAt = new Date();
        await this.supplierTokensRepository.save(tokenRecord);

        sent.push(supplier.name);
      } catch (error) {
        this.logger.error(`Error enviando email a ${tokenRecord.supplier?.name}:`, error);
        failed.push(tokenRecord.supplier?.name || 'Desconocido');
      }
    }

    // Actualizar estado de la cotización si se envió al menos un email
    if (sent.length > 0 && quotation.status === 'borrador') {
      quotation.status = 'enviada';
      await this.quotationsRepository.save(quotation);
    }

    return { sent, failed };
  }

  async validateSupplierToken(quotationId: string, token: string): Promise<{
    valid: boolean;
    supplier?: Supplier;
    quotation?: Quotation;
    tokenRecord?: QuotationSupplierToken;
  }> {
    const tokenRecord = await this.supplierTokensRepository.findOne({
      where: { quotationId, token },
      relations: ['supplier', 'quotation', 'quotation.items', 'quotation.items.product', 'quotation.items.product.unit'],
    });

    if (!tokenRecord) {
      return { valid: false };
    }

    if (new Date() > tokenRecord.expiresAt) {
      return { valid: false };
    }

    return {
      valid: true,
      supplier: tokenRecord.supplier,
      quotation: tokenRecord.quotation,
      tokenRecord,
    };
  }

  async getQuotationForSupplier(quotationId: string, token: string): Promise<{
    quotation: Quotation;
    supplier: Supplier;
    alreadyResponded: boolean;
    previousResponses?: QuotationSupplierResponse[];
  }> {
    const validation = await this.validateSupplierToken(quotationId, token);

    if (!validation.valid) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Buscar respuestas previas
    const previousResponses = await this.supplierResponsesRepository.find({
      where: {
        supplierId: validation.supplier.id,
      },
      relations: ['quotationItem'],
    });

    const alreadyResponded = previousResponses.some(
      (r) => r.quotationItem.quotationId === quotationId,
    );

    return {
      quotation: validation.quotation,
      supplier: validation.supplier,
      alreadyResponded,
      previousResponses: alreadyResponded ? previousResponses.filter((r) => r.quotationItem.quotationId === quotationId) : undefined,
    };
  }

  async submitSupplierResponse(
    quotationId: string,
    token: string,
    responseDto: SubmitSupplierResponseDto,
  ): Promise<{ success: boolean; message: string }> {
    const validation = await this.validateSupplierToken(quotationId, token);

    if (!validation.valid) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const { supplier, quotation, tokenRecord } = validation;

    // Verificar que los items pertenecen a la cotización
    const quotationItemIds = quotation.items.map((item) => item.id);
    const invalidItems = responseDto.items.filter(
      (item) => !quotationItemIds.includes(item.quotationItemId),
    );

    if (invalidItems.length > 0) {
      throw new BadRequestException('Algunos items no pertenecen a esta cotización');
    }

    // Eliminar respuestas anteriores si las hay
    await this.supplierResponsesRepository.delete({
      supplierId: supplier.id,
      quotationItemId: In(quotationItemIds),
    });

    // Guardar nuevas respuestas
    for (const itemResponse of responseDto.items) {
      const response = this.supplierResponsesRepository.create({
        quotationItemId: itemResponse.quotationItemId,
        supplierId: supplier.id,
        price: itemResponse.price,
        currency: itemResponse.currency || 'MXN',
        leadTimeDays: itemResponse.leadTimeDays,
        notes: itemResponse.notes,
        available: itemResponse.available !== false,
      });
      await this.supplierResponsesRepository.save(response);
    }

    // Marcar token como usado
    tokenRecord.used = true;
    tokenRecord.usedAt = new Date();
    await this.supplierTokensRepository.save(tokenRecord);

    // Actualizar estado de la cotización
    await this.updateQuotationStatus(quotationId);

    // Enviar confirmación por email
    try {
      await this.mailService.sendQuotationConfirmation(
        supplier.email,
        supplier.contactName || supplier.name,
        quotation.code,
      );
    } catch (error) {
      this.logger.error('Error enviando confirmación:', error);
    }

    return {
      success: true,
      message: 'Cotización enviada exitosamente. Recibirás un correo de confirmación.',
    };
  }

  private async updateQuotationStatus(quotationId: string): Promise<void> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      relations: ['supplierTokens'],
    });

    const totalTokens = quotation.supplierTokens.length;
    const usedTokens = quotation.supplierTokens.filter((t) => t.used).length;

    if (usedTokens === totalTokens && totalTokens > 0) {
      quotation.status = 'completada';
    } else if (usedTokens > 0) {
      quotation.status = 'parcial';
    }

    await this.quotationsRepository.save(quotation);
  }

  async getQuotationComparison(quotationId: string): Promise<{
    quotation: Quotation;
    comparison: {
      item: QuotationItem;
      responses: {
        supplier: Supplier;
        price: number;
        currency: string;
        leadTimeDays?: number;
        available: boolean;
        notes?: string;
      }[];
      bestPrice?: {
        supplierId: string;
        supplierName: string;
        price: number;
      };
    }[];
  }> {
    const quotation = await this.findOne(quotationId);

    const comparison = quotation.items.map((item) => {
      const responses = item.supplierResponses?.map((r) => ({
        supplier: r.supplier,
        price: Number(r.price),
        currency: r.currency,
        leadTimeDays: r.leadTimeDays,
        available: r.available,
        notes: r.notes,
      })) || [];

      // Encontrar mejor precio (solo de productos disponibles)
      const availableResponses = responses.filter((r) => r.available);
      const bestPrice = availableResponses.length > 0
        ? availableResponses.reduce((best, current) =>
            current.price < best.price ? current : best,
          )
        : undefined;

      return {
        item,
        responses,
        bestPrice: bestPrice
          ? {
              supplierId: bestPrice.supplier.id,
              supplierName: bestPrice.supplier.name,
              price: bestPrice.price,
            }
          : undefined,
      };
    });

    return { quotation, comparison };
  }

  async markAsWinner(quotationId: string, supplierId: string): Promise<Quotation> {
    const quotation = await this.findOne(quotationId);
    
    // Verificar que el proveedor haya respondido
    const hasResponse = quotation.items.some(
      (item) => item.supplierResponses?.some((r) => r.supplierId === supplierId),
    );

    if (!hasResponse) {
      throw new BadRequestException('El proveedor no ha enviado cotización');
    }

    quotation.status = 'cerrada';
    quotation.winningSupplierId = supplierId;
    await this.quotationsRepository.save(quotation);

    return quotation;
  }

  async cancel(quotationId: string): Promise<Quotation> {
    const quotation = await this.findOne(quotationId);
    quotation.status = 'cancelada';
    await this.quotationsRepository.save(quotation);
    return quotation;
  }
}
