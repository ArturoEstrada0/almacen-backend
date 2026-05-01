import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe, Req, Query, UseInterceptors, UploadedFile, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { PurchaseOrdersService } from "./purchase-orders.service"
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto"
import { RegisterPaymentDto } from "./dto/register-payment.dto"
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto"
import type { Request } from 'express'
import * as multer from "multer"
import { createClient } from "@supabase/supabase-js"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"

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

async function savePurchaseOrderPaymentInvoice(file?: any): Promise<string | undefined> {
  if (!file) return undefined

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = "purchase-order-payments"

  if (!supabaseUrl || !supabaseKey) return undefined

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  await ensureStorageBucket(supabase, bucket)

  const originalName = String(file.originalname || "invoice")
  const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, "_")
  const path = `purchase-orders/${Date.now()}-${safeName}`
  const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer)

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.mimetype || "application/octet-stream",
    upsert: false,
  })

  if (uploadError) {
    throw uploadError
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
  return urlData?.publicUrl
}

@ApiTags("purchase-orders")
@Controller("purchase-orders")
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new purchase order" })
  @ApiResponse({ status: 201, description: "Purchase order created successfully" })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Req() req: Request) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto, req as any)
  }

  @Get()
  @ApiOperation({ summary: "Get all purchase orders" })
  @ApiResponse({ status: 200, description: "List of purchase orders" })
  findAll(@Query('supplierId') supplierId?: string) {
    return this.purchaseOrdersService.findAll(supplierId)
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payments history' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  findPayments(
    @Query('supplierId') supplierId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseOrdersService.findPayments({ supplierId, startDate, endDate, status })
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending purchase invoices (with balance) optionally filtered by due date range or supplier' })
  @ApiResponse({ status: 200, description: 'List of pending purchase orders' })
  findPending(
    @Query('supplierId') supplierId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.purchaseOrdersService.findPending({ supplierId, startDate, endDate })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(":id/receive/:itemId")
  @ApiOperation({ summary: "Receive items from purchase order" })
  @ApiResponse({ status: 200, description: "Items received successfully" })
  receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.purchaseOrdersService.receive(id, itemId, quantity)
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order cancelled' })
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.purchaseOrdersService.cancel(id, req as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a purchase order (items and quantities). Supplier cannot be changed.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdatePurchaseOrderDto, @Req() req: Request) {
    return this.purchaseOrdersService.update(id, updateDto as any, req as any)
  }

  @Post(':id/payment')
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
  @ApiOperation({ summary: 'Register a payment for a purchase order' })
  @ApiResponse({ status: 200, description: 'Payment registered successfully' })
  async registerPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() registerPaymentDto: RegisterPaymentDto,
    @UploadedFile() invoiceFile: any,
  ) {
    const invoiceFileUrl = await savePurchaseOrderPaymentInvoice(invoiceFile)
    const payload: RegisterPaymentDto = {
      ...registerPaymentDto,
      invoiceFileUrl: invoiceFileUrl || registerPaymentDto.invoiceFileUrl,
    }
    return this.purchaseOrdersService.registerPayment(id, payload)
  }
}
