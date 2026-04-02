import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Like, ILike } from "typeorm"
import { Customer } from "./entities/customer.entity"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { UpdateCustomerDto } from "./dto/update-customer.dto"

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
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
}
