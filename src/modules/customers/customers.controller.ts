import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { CustomersService } from "./customers.service"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { UpdateCustomerDto } from "./dto/update-customer.dto"
import { Customer } from "./entities/customer.entity"
import { CreateCustomerReceivableDto } from "./dto/create-customer-receivable.dto"
import { RegisterCustomerReceivablePaymentDto } from "./dto/register-customer-receivable-payment.dto"
import type { Request } from "express"
import * as multer from "multer"
import { createClient } from "@supabase/supabase-js"

async function ensureStorageBucket(supabase: any, bucket: string) {
  const { data: existing, error } = await supabase.storage.getBucket(bucket)
  if (existing) return

  if (error && !String(error.message || "").toLowerCase().includes("not found")) {
    throw error
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: "10MB",
    allowedMimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/webp"],
  })

  if (createError && !String(createError.message || "").toLowerCase().includes("already")) {
    throw createError
  }
}

async function saveCustomerPaymentInvoice(file?: any): Promise<string | undefined> {
  if (!file) return undefined

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const allowLocalFallback = process.env.ALLOW_LOCAL_UPLOAD_FALLBACK === "true"
  const bucket = "customer-payments"

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      await ensureStorageBucket(supabase, bucket)

      const originalName = String(file.originalname || "invoice")
      const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_")
      const path = `customer-receivables/${Date.now()}-${safeName}`
      const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer)

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
        contentType: file.mimetype || "application/octet-stream",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
      if (urlData?.publicUrl) {
        return urlData.publicUrl
      }

      throw new Error("No se pudo generar URL pública para la factura")
    } catch (error: any) {
      if (!allowLocalFallback) {
        throw error
      }
      console.warn("[customer-payments] Supabase upload failed, using local fallback:", error?.message || error)
    }
  }

  if (!allowLocalFallback) {
    return undefined
  }

  return undefined
}

@ApiTags("customers")
@Controller("customers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Crear nuevo cliente
   * Solo administradores
   */
  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Crear nuevo cliente" })
  @ApiResponse({ status: 201, description: "Cliente creado exitosamente", type: Customer })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 409, description: "RFC o email duplicado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersService.create(createCustomerDto)
  }

  /**
   * Obtener todos los clientes
   * Solo administradores
   */
  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Obtener lista de todos los clientes" })
  @ApiResponse({ status: 200, description: "Lista de clientes", type: [Customer] })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findAll(): Promise<Customer[]> {
    return this.customersService.findAll()
  }

  /**
   * Obtener solo clientes activos
   * Solo administradores
   */
  @Get("active")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener lista de clientes activos" })
  @ApiResponse({ status: 200, description: "Lista de clientes activos", type: [Customer] })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findAllActive(): Promise<Customer[]> {
    return this.customersService.findAllActive()
  }

  /**
   * Buscar clientes por nombre, RFC o email
   * Solo administradores
   */
  @Get("search")
  @Roles("admin")
  @ApiOperation({ summary: "Buscar clientes por nombre, RFC o email" })
  @ApiResponse({ status: 200, description: "Clientes encontrados", type: [Customer] })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async search(@Query("q") query: string): Promise<Customer[]> {
    return this.customersService.search(query)
  }

  /**
   * Obtener cliente por ID
   * Solo administradores
   */
  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener cliente por ID" })
  @ApiResponse({ status: 200, description: "Detalles del cliente", type: Customer })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Customer> {
    return this.customersService.findOne(id)
  }

  @Get(":id/account-statement")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener estado de cuenta del cliente" })
  @ApiResponse({ status: 200, description: "Estado de cuenta" })
  getAccountStatement(@Param("id", ParseUUIDPipe) id: string) {
    return this.customersService.getAccountStatement(id)
  }

  @Get(":id/receivables")
  @Roles("admin")
  @ApiOperation({ summary: "Listar cuentas por cobrar del cliente" })
  @ApiResponse({ status: 200, description: "Listado de cuentas por cobrar" })
  listReceivables(@Param("id", ParseUUIDPipe) id: string) {
    return this.customersService.listReceivables(id)
  }

  @Get("receivables/pending")
  @Roles("admin")
  @ApiOperation({ summary: "Listar cuentas por cobrar pendientes (global)" })
  @ApiResponse({ status: 200, description: "Listado de cuentas por cobrar pendientes" })
  findPendingReceivables(@Query('customerId') customerId?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.customersService.findPendingReceivables({ customerId, startDate, endDate })
  }

  @Post(":id/receivables")
  @Roles("admin")
  @ApiOperation({ summary: "Registrar venta / factura a crédito" })
  @ApiResponse({ status: 201, description: "Cuenta por cobrar creada" })
  createReceivable(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateCustomerReceivableDto,
    @Req() req: Request,
  ) {
    return this.customersService.createReceivable(id, dto, req as any)
  }

  @Get(":id/receivables/:receivableId")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener detalle de una cuenta por cobrar" })
  @ApiResponse({ status: 200, description: "Detalle de cuenta por cobrar" })
  getReceivable(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("receivableId", ParseUUIDPipe) receivableId: string,
  ) {
    return this.customersService.getReceivable(id, receivableId)
  }

  @Post(":id/receivables/:receivableId/payments")
  @Roles("admin")
  @UseInterceptors(
    FileInterceptor("invoiceFile", {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const mime = String(file.mimetype || "").toLowerCase()
        const isAllowed = mime === "application/pdf" || mime.startsWith("image/")
        cb(isAllowed ? null : new Error("Solo se permiten archivos PDF o imágenes"), isAllowed)
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Registrar abono" })
  @ApiResponse({ status: 201, description: "Abono registrado" })
  async registerPayment(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("receivableId", ParseUUIDPipe) receivableId: string,
    @Body() dto: RegisterCustomerReceivablePaymentDto,
    @UploadedFile() invoiceFile: any,
    @Req() req: Request,
  ) {
    const invoiceFileUrl = await saveCustomerPaymentInvoice(invoiceFile)
    const payload: RegisterCustomerReceivablePaymentDto = {
      ...dto,
      invoiceFileUrl: invoiceFileUrl || dto.invoiceFileUrl,
    }
    return this.customersService.registerPayment(id, receivableId, payload, req as any)
  }

  /**
   * Obtener cliente por RFC
   * Solo administradores
   */
  @Get("rfc/:rfc")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener cliente por RFC" })
  @ApiResponse({ status: 200, description: "Detalles del cliente", type: Customer })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findByRFC(@Param("rfc") rfc: string): Promise<Customer> {
    return this.customersService.findByRFC(rfc)
  }

  /**
   * Actualizar cliente
   * Solo administradores
   */
  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Actualizar datos del cliente" })
  @ApiResponse({ status: 200, description: "Cliente actualizado", type: Customer })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 409, description: "RFC o email duplicado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.update(id, updateCustomerDto)
  }

  /**
   * Cambiar estado de cliente (activo/inactivo)
   * Solo administradores
   */
  @Patch(":id/toggle-active")
  @Roles("admin")
  @ApiOperation({ summary: "Activar o desactivar cliente" })
  @ApiResponse({ status: 200, description: "Estado del cliente actualizado", type: Customer })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async toggleActive(@Param("id", ParseUUIDPipe) id: string): Promise<Customer> {
    return this.customersService.toggleActive(id)
  }

  /**
   * Eliminar cliente
   * Solo administradores
   */
  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Eliminar cliente" })
  @ApiResponse({ status: 200, description: "Cliente eliminado exitosamente" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.customersService.remove(id)
  }
}
