import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository, ILike } from "typeorm"
import { Customer } from "./entities/customer.entity"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { UpdateCustomerDto } from "./dto/update-customer.dto"
import { CustomerReceivableInvoice } from "./entities/customer-receivable.entity"
import { CustomerReceivablePayment } from "./entities/customer-receivable-payment.entity"
import { CreateCustomerReceivableDto } from "./dto/create-customer-receivable.dto"
import { RegisterCustomerReceivablePaymentDto } from "./dto/register-customer-receivable-payment.dto"
import { TraceabilityService } from "../traceability/traceability.service"

@Injectable()
export class CustomersService {
  private extractShipmentNumber(notes?: string | null, fallbackValue?: string | null, invoiceNumber?: string | null): string | null {
    const rawNotes = String(notes || "")
    const noteMatch = rawNotes.match(/embarque\s*[:#-]?\s*([A-Za-z0-9-]+)/i)
    if (noteMatch?.[1]) {
      return noteMatch[1]
    }

    const invoiceCandidate = String(invoiceNumber || "").trim()
    if (/^(EMB|SHIP|TRK|ENV|VIAJE)[A-Za-z0-9-]*$/i.test(invoiceCandidate)) {
      return invoiceCandidate
    }

    const fallbackCandidate = String(fallbackValue || "").trim()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fallbackCandidate)
    if (fallbackCandidate && !isUuid) {
      return fallbackCandidate
    }

    return null
  }

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
    @InjectRepository(CustomerReceivableInvoice)
    private readonly receivablesRepository: Repository<CustomerReceivableInvoice>,
    @InjectRepository(CustomerReceivablePayment)
    private readonly receivablePaymentsRepository: Repository<CustomerReceivablePayment>,
    private readonly traceabilityService: TraceabilityService,
  ) {}

  /**
   * Crear nuevo cliente
   */
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Verificar si el RFC ya existe
    const existingRFC = await this.customersRepository.findOne({
      where: { rfc: createCustomerDto.rfc.toUpperCase() },
    })

    if (existingRFC) {
      throw new ConflictException(`Ya existe un cliente con el RFC: ${createCustomerDto.rfc}`)
    }

    // Verificar si el email ya existe
    const existingEmail = await this.customersRepository.findOne({
      where: { email: createCustomerDto.email.toLowerCase() },
    })

    if (existingEmail) {
      throw new ConflictException(`Ya existe un cliente con el email: ${createCustomerDto.email}`)
    }

    // Normalizar datos
    const normalizedDto = this.normalizeCustomerData(createCustomerDto)

    // Validar lógica de negocio
    this.validatePaymentData(normalizedDto)

    // Construir dirección completa
    normalizedDto.fullAddress = this.buildFullAddress(normalizedDto)

    const customer = this.customersRepository.create(normalizedDto as Partial<Customer>)
    return await this.customersRepository.save(customer)
  }

  /**
   * Obtener todos los clientes
   */
  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find({
      order: { name: "ASC" },
    })
  }

  /**
   * Obtener solo clientes activos
   */
  async findAllActive(): Promise<Customer[]> {
    return await this.customersRepository.find({
      where: { active: true },
      order: { name: "ASC" },
    })
  }

  /**
   * Buscar cliente por ID
   */
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
    })

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`)
    }

    return customer
  }

  /**
   * Buscar cliente por RFC
   */
  async findByRFC(rfc: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { rfc: rfc.toUpperCase() },
    })

    if (!customer) {
      throw new NotFoundException(`Cliente con RFC ${rfc} no encontrado`)
    }

    return customer
  }

  /**
   * Buscar cliente por email
   */
  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { email: email.toLowerCase() },
    })

    if (!customer) {
      throw new NotFoundException(`Cliente con email ${email} no encontrado`)
    }

    return customer
  }

  /**
   * Buscar/filtrar clientes por nombre, RFC o email
   */
  async search(query: string): Promise<Customer[]> {
    if (!query || query.trim().length === 0) {
      return await this.findAll()
    }

    const searchTerm = query.trim()

    return await this.customersRepository.find({
      where: [
        { name: ILike(`%${searchTerm}%`) },
        { rfc: ILike(`%${searchTerm}%`) },
        { email: ILike(`%${searchTerm}%`) },
        { contactName: ILike(`%${searchTerm}%`) },
      ],
      order: { name: "ASC" },
    })
  }

  /**
   * Actualizar cliente
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id)

    // Si cambió el RFC, verificar que no exista otro con ese RFC
    if (updateCustomerDto.rfc && updateCustomerDto.rfc.toUpperCase() !== customer.rfc) {
      const existingRFC = await this.customersRepository.findOne({
        where: { rfc: updateCustomerDto.rfc.toUpperCase() },
      })
      if (existingRFC) {
        throw new ConflictException(`Ya existe otro cliente con el RFC: ${updateCustomerDto.rfc}`)
      }
    }

    // Si cambió el email, verificar que no exista otro con ese email
    if (updateCustomerDto.email && updateCustomerDto.email.toLowerCase() !== customer.email) {
      const existingEmail = await this.customersRepository.findOne({
        where: { email: updateCustomerDto.email.toLowerCase() },
      })
      if (existingEmail) {
        throw new ConflictException(`Ya existe otro cliente con el email: ${updateCustomerDto.email}`)
      }
    }

    // Normalizar datos
    const normalizedDto = this.normalizeCustomerData(updateCustomerDto)

    // Validar lógica de negocio
    this.validatePaymentData({ ...customer, ...normalizedDto })

    // Actualizar dirección completa si se modificó algún componente de dirección
    if (
      normalizedDto.street ||
      normalizedDto.streetNumber ||
      normalizedDto.neighborhood ||
      normalizedDto.city ||
      normalizedDto.state ||
      normalizedDto.postalCode
    ) {
      const updatedData = { ...customer, ...normalizedDto }
      normalizedDto.fullAddress = this.buildFullAddress({
        street: updatedData.street,
        streetNumber: updatedData.streetNumber,
        neighborhood: updatedData.neighborhood,
        city: updatedData.city,
        state: updatedData.state,
        postalCode: updatedData.postalCode,
      })
    }

    Object.assign(customer, normalizedDto)
    return await this.customersRepository.save(customer)
  }

  /**
   * Eliminar cliente
   */
  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id)
    const receivablesCount = await this.receivablesRepository.count({ where: { customerId: id } })
    if (receivablesCount > 0) {
      throw new BadRequestException("No se puede eliminar el cliente porque tiene cuentas por cobrar registradas")
    }
    await this.customersRepository.remove(customer)
  }

  /**
   * Cambiar estado de cliente (activo/inactivo)
   */
  async toggleActive(id: string): Promise<Customer> {
    const customer = await this.findOne(id)
    customer.active = !customer.active
    return await this.customersRepository.save(customer)
  }

  /**
   * Normalizar datos del cliente
   */
  private normalizeCustomerData(dto: CreateCustomerDto | UpdateCustomerDto): any {
    const normalized: any = { ...dto }

    // Convertir RFC a mayúsculas
    if (normalized.rfc) {
      normalized.rfc = normalized.rfc.toUpperCase()
    }

    // Convertir email a minúsculas
    if (normalized.email) {
      normalized.email = normalized.email.toLowerCase()
    }

    // Limpiar teléfono (remover caracteres especiales pero mantener números)
    if (normalized.phone) {
      normalized.phone = normalized.phone.replace(/[\s\-()]/g, "")
    }

    // Si no proporciona CLABE, asignar undefined (no guardar vacío)
    if (normalized.clabe === "") {
      normalized.clabe = undefined
    }

    return normalized
  }

  /**
   * Validar datos de pago
   */
  private validatePaymentData(customer: any): void {
    // Si la forma de pago es transferencia bancaria, validar que tenga datos bancarios
    if (customer.paymentMethod === "bank_transfer") {
      if (!customer.bankName || !customer.clabe) {
        throw new BadRequestException(
          "Para pago por transferencia bancaria, debe proporcionar el nombre del banco y CLABE",
        )
      }
    }

    // Validar CLABE si se proporciona
    if (customer.clabe && customer.paymentMethod !== "bank_transfer") {
      console.warn("Se proporcionó CLABE pero la forma de pago no es transferencia bancaria")
    }
  }

  /**
   * Construir dirección completa a partir de componentes
   */
  private buildFullAddress(data: any): string {
    const parts = []

    if (data.street) parts.push(data.street)
    if (data.streetNumber) parts.push(data.streetNumber)
    if (data.neighborhood) parts.push(data.neighborhood)
    if (data.city) parts.push(data.city)
    if (data.state) parts.push(data.state)
    if (data.postalCode) parts.push(data.postalCode)

    return parts.filter(Boolean).join(", ")
  }

  private parseDate(value: string | Date): Date {
    if (value instanceof Date) return value

    const datePrefix = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (datePrefix) {
      const year = Number(datePrefix[1])
      const month = Number(datePrefix[2])
      const day = Number(datePrefix[3])
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
    }

    return new Date(value)
  }

  private getDateOnly(value: string | Date): string {
    if (value instanceof Date) {
      const year = value.getUTCFullYear()
      const month = String(value.getUTCMonth() + 1).padStart(2, "0")
      const day = String(value.getUTCDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const datePrefix = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!datePrefix) {
      throw new BadRequestException("Formato de fecha inválido. Usa YYYY-MM-DD")
    }

    return `${datePrefix[1]}-${datePrefix[2]}-${datePrefix[3]}`
  }

  private addDaysDateOnly(baseDate: string, days: number): string {
    const [year, month, day] = baseDate.split("-").map(Number)
    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
    utcDate.setUTCDate(utcDate.getUTCDate() + Number(days || 0))
    const outYear = utcDate.getUTCFullYear()
    const outMonth = String(utcDate.getUTCMonth() + 1).padStart(2, "0")
    const outDay = String(utcDate.getUTCDate()).padStart(2, "0")
    return `${outYear}-${outMonth}-${outDay}`
  }

  private getTodayDateOnly(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  private addDays(baseDate: Date, days: number): Date {
    const result = new Date(baseDate)
    result.setDate(result.getDate() + days)
    return result
  }

  private toNumber(value: any): number {
    return Number(value ?? 0)
  }

  private getUser(req?: any): { id: string; name: string } {
    return {
      id: req?.user?.id || req?.user?.username || "unknown",
      name: req?.user?.name || req?.user?.username || "unknown",
    }
  }

  private computeStatus(invoice: { dueDate: Date | string; balanceAmount: number; paidAmount: number }): CustomerReceivableInvoice["status"] {
    const balance = this.toNumber(invoice.balanceAmount)
    if (balance <= 0) return "pagada"
    const dueDate = this.getDateOnly(invoice.dueDate)
    const today = this.getTodayDateOnly()
    if (today > dueDate) return "vencida"
    if (this.toNumber(invoice.paidAmount) > 0) return "parcial"
    return "pendiente"
  }

  private normalizeReceivable(receivable: CustomerReceivableInvoice) {
    const dueDate = this.getDateOnly(receivable.dueDate)
    const today = this.getTodayDateOnly()

    return {
      ...receivable,
      saleDate: this.getDateOnly(receivable.saleDate),
      invoiceDate: this.getDateOnly(receivable.invoiceDate),
      dueDate,
      originalAmount: this.toNumber(receivable.originalAmount),
      paidAmount: this.toNumber(receivable.paidAmount),
      balanceAmount: this.toNumber(receivable.balanceAmount),
      isOverdue: this.toNumber(receivable.balanceAmount) > 0 && today > dueDate,
      status: this.computeStatus(receivable),
      payments: [...(receivable.payments || [])]
        .sort((a, b) => new Date(a.createdAt || a.paymentDate || 0).getTime() - new Date(b.createdAt || b.paymentDate || 0).getTime())
        .map((payment) => ({
          ...payment,
          amount: this.toNumber(payment.amount),
        })),
    }
  }

  async createReceivable(customerId: string, dto: CreateCustomerReceivableDto, req?: any) {
    const customer = await this.findOne(customerId)
    const invoiceDate = this.getDateOnly(dto.invoiceDate)
    const saleDate = this.getDateOnly(dto.saleDate)
    const creditDays = dto.creditDays ?? customer.creditDays ?? 0
    const dueDate = this.addDaysDateOnly(invoiceDate, creditDays)

    const existing = await this.receivablesRepository.findOne({
      where: { customerId, invoiceNumber: dto.invoiceNumber },
    })
    if (existing) {
      throw new ConflictException(`Ya existe una cuenta por cobrar con la factura ${dto.invoiceNumber} para este cliente`)
    }

    const user = this.getUser(req)
    const receivable = this.receivablesRepository.create({
      customerId,
      invoiceNumber: dto.invoiceNumber,
      saleDate,
      invoiceDate,
      creditDays,
      dueDate,
      originalAmount: dto.originalAmount,
      paidAmount: 0,
      balanceAmount: dto.originalAmount,
      status: this.computeStatus({ dueDate, balanceAmount: dto.originalAmount, paidAmount: 0 }),
      notes: dto.notes,
      createdByUserId: user.id,
      createdByUserName: user.name,
    })

    const saved = await this.receivablesRepository.save(receivable)

    await this.traceabilityService.record({
      entityType: "customer_receivable",
      entityId: saved.id,
      action: "created",
      userId: user.id,
      userName: user.name,
      details: {
        customerId,
        invoiceNumber: dto.invoiceNumber,
        originalAmount: dto.originalAmount,
        creditDays,
        dueDate,
      },
      result: "success",
    })

    return this.getReceivable(customerId, saved.id)
  }

  async listReceivables(customerId: string) {
    await this.findOne(customerId)
    const receivables = await this.receivablesRepository.find({
      where: { customerId },
      relations: ["payments"],
      order: { createdAt: "DESC", payments: { createdAt: "ASC" } as any },
    })

    return receivables.map((receivable) => this.normalizeReceivable(receivable))
  }

  async getReceivable(customerId: string, receivableId: string) {
    const receivable = await this.receivablesRepository.findOne({
      where: { id: receivableId, customerId },
      relations: ["payments", "customer"],
      order: { payments: { createdAt: "DESC" } as any },
    })

    if (!receivable) {
      throw new NotFoundException(`Cuenta por cobrar ${receivableId} no encontrada`)
    }

    return this.normalizeReceivable(receivable)
  }

  async getAccountStatement(customerId: string) {
    const customer = await this.findOne(customerId)
    const receivables = await this.listReceivables(customerId)

    const totals = receivables.reduce(
      (acc, receivable: any) => {
        acc.originalAmount += this.toNumber(receivable.originalAmount)
        acc.paidAmount += this.toNumber(receivable.paidAmount)
        acc.balanceAmount += this.toNumber(receivable.balanceAmount)
        if (receivable.isOverdue) acc.overdueCount += 1
        return acc
      },
      { originalAmount: 0, paidAmount: 0, balanceAmount: 0, overdueCount: 0 },
    )

    return { customer, totals, receivables }
  }

  /**
   * Find pending receivables across customers with optional date range filter
   */
  async findPendingReceivables(opts?: { customerId?: string; startDate?: string; endDate?: string }) {
    const qb = this.receivablesRepository.createQueryBuilder('r')
      .leftJoinAndSelect('r.customer', 'customer')
      .where('COALESCE(r.balance_amount::numeric,0) > 0')

    if (opts?.customerId) qb.andWhere('r.customer_id = :customerId', { customerId: opts.customerId })
    if (opts?.startDate) qb.andWhere('r.due_date >= :startDate', { startDate: opts.startDate })
    if (opts?.endDate) qb.andWhere('r.due_date <= :endDate', { endDate: opts.endDate })

    qb.orderBy('r.due_date', 'ASC')

    const rows = await qb.getMany()

    return rows.map((r: any) => ({
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      customerId: r.customerId,
      customerName: r.customer ? (r.customer.name || r.customer.fullName) : null,
      shipmentId: (r as any).shipmentId || null,
      shipmentNumber: this.extractShipmentNumber((r as any).notes, (r as any).shipmentId || null, r.invoiceNumber),
      total: Number(r.originalAmount || 0),
      date: r.saleDate,
      dueDate: r.dueDate,
      amountPaid: Number(r.paidAmount || 0),
      pendingAmount: Math.max(0, Number(r.originalAmount || 0) - Number(r.paidAmount || 0)),
    }))
  }

  async registerPayment(customerId: string, receivableId: string, dto: RegisterCustomerReceivablePaymentDto, req?: any) {
    const user = this.getUser(req)

    const result = await this.dataSource.transaction(async (manager) => {
      const customer = await manager.getRepository(Customer).findOne({ where: { id: customerId } })
      if (!customer) {
        throw new NotFoundException(`Cliente con ID ${customerId} no encontrado`)
      }

      const receivablesRepo = manager.getRepository(CustomerReceivableInvoice)
      const paymentsRepo = manager.getRepository(CustomerReceivablePayment)

      const receivable = await receivablesRepo.findOne({
        where: { id: receivableId, customerId },
        relations: ["payments", "customer"],
      })

      if (!receivable) {
        throw new NotFoundException(`Cuenta por cobrar ${receivableId} no encontrada`)
      }

      if (!receivable.customer) {
        throw new BadRequestException("La factura no está ligada a un cliente válido del catálogo")
      }

      const amount = this.toNumber(dto.amount)
      const currentPaid = this.toNumber(receivable.paidAmount)
      const balance = this.toNumber(receivable.balanceAmount)

      if (amount <= 0) {
        throw new BadRequestException("El monto del abono debe ser mayor a cero")
      }

      if (amount > balance) {
        throw new BadRequestException("El saldo pendiente nunca puede ser negativo")
      }

      const payment = paymentsRepo.create({
        receivableId,
        customerId,
        paymentDate: this.getDateOnly(dto.paymentDate) as any,
        amount,
        reference: dto.reference,
        notes: dto.notes,
        invoiceFileUrl: dto.invoiceFileUrl,
        capturedByUserId: user.id,
        capturedByUserName: user.name,
      })

      receivable.paidAmount = currentPaid + amount
      receivable.balanceAmount = Math.max(0, this.toNumber(receivable.originalAmount) - receivable.paidAmount)
      receivable.lastPaymentAt = this.parseDate(dto.paymentDate)
      receivable.lastPaymentReference = dto.reference
      receivable.status = this.computeStatus(receivable)

      await receivablesRepo.save(receivable)
      const savedPayment = await paymentsRepo.save(payment)

      return {
        receivable,
        payment: savedPayment,
        customerName: receivable.customer?.name || customer.name,
        balanceBefore: balance,
        balanceAfter: Math.max(0, balance - amount),
        amount,
      }
    })

    await this.traceabilityService.record({
      entityType: "customer_receivable",
      entityId: receivableId,
      action: "payment_registered",
      userId: user.id,
      userName: user.name,
      details: {
        customerId,
        customerName: result.customerName,
        amount: result.amount,
        balanceBefore: result.balanceBefore,
        balanceAfter: result.balanceAfter,
        reference: dto.reference,
        paymentDate: dto.paymentDate,
        invoiceFileUrl: dto.invoiceFileUrl,
      },
      result: "success",
    })

    return this.getReceivable(customerId, result.receivable.id)
  }
}
