import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, UseInterceptors, UploadedFiles } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { ProducersService } from "./producers.service"
import { CreateProducerDto } from "./dto/create-producer.dto"
import { CreateInputAssignmentDto } from "./dto/create-input-assignment.dto"
import { CreateInputReturnDto } from "./dto/create-input-return.dto"
import { CreateFruitReceptionDto } from "./dto/create-fruit-reception.dto"
import { CreateShipmentDto } from "./dto/create-shipment.dto"
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { promises as fs } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

/**
 * Save files to Supabase Storage (bucket 'uploads', folder 'shipments').
 * Falls back to local disk writes only when ALLOW_LOCAL_UPLOAD_FALLBACK=true.
 */
async function saveFilesToUploads(files: Record<string, any[]> | undefined) {
  const result: Record<string, string | undefined> = {}
  if (!files) return result

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const useSupabase = !!(supabaseUrl && supabaseKey)
  const allowLocalFallback = process.env.ALLOW_LOCAL_UPLOAD_FALLBACK === 'true'

  // prepare local base for fallback
  const base = join(process.cwd(), 'uploads', 'shipments')

  // create supabase client if possible
  const supabase = useSupabase
    ? createClient(supabaseUrl as string, supabaseKey as string, { auth: { autoRefreshToken: false, persistSession: false } })
    : null

  for (const key of Object.keys(files)) {
    const arr = files[key]
    if (!arr || arr.length === 0) continue
    const file = arr[0]
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const filename = `${Date.now()}-${safeName}`

    // Try Supabase upload first
    if (supabase) {
      try {
        const bucket = 'uploads'
        const path = `shipments/${filename}`
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
        if (urlData && (urlData as any).publicUrl) {
          result[key] = (urlData as any).publicUrl
          continue
        }

        throw new Error('Could not generate public URL from Supabase Storage')
      } catch (err) {
        console.warn('[uploads] Supabase upload failed for', filename, err?.message || err)
        if (!allowLocalFallback) {
          throw err
        }
      }
    }

    if (useSupabase && !allowLocalFallback) {
      continue
    }

    // Fallback: write file to local uploads directory and return relative URL
    try {
      const dirExists = await fs.stat(base).then(() => true).catch(() => false)
      if (!dirExists) await fs.mkdir(base, { recursive: true })
      const dest = join(base, filename)
      await fs.writeFile(dest, file.buffer)
      result[key] = `/uploads/shipments/${filename}`
    } catch (err) {
      console.error('[uploads] local write failed for', filename, err?.message || err)
      // if even fallback fails, leave undefined
      result[key] = undefined
    }
  }

  return result
}
import { CreatePaymentDto } from "./dto/create-payment.dto"
import { CreatePaymentReportDto, UpdatePaymentReportStatusDto } from "./dto/create-payment-report.dto"
import { UpdateProducerDto } from "./dto/update-producer.dto"

@ApiTags("producers")
@Controller("producers")
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new producer" })
  @ApiResponse({ status: 201, description: "Producer created successfully" })
  create(@Body() createProducerDto: CreateProducerDto) {
    return this.producersService.create(createProducerDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all producers" })
  @ApiResponse({ status: 200, description: "List of producers" })
  findAll() {
    return this.producersService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a producer by ID' })
  @ApiResponse({ status: 200, description: 'Producer details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.producersService.findOne(id);
  }

  @Post("input-assignments")
  @ApiOperation({ summary: "Create input assignment" })
  @ApiResponse({ status: 201, description: "Input assignment created" })
  createInputAssignment(@Body() dto: CreateInputAssignmentDto) {
    return this.producersService.createInputAssignment(dto)
  }

  @Post("input-returns")
  @ApiOperation({ summary: "Create input return (devolución)" })
  @ApiResponse({ status: 201, description: "Input return created" })
  createInputReturn(@Body() dto: CreateInputReturnDto) {
    return this.producersService.createInputReturn(dto)
  }

  @Get("input-returns/all")
  @ApiOperation({ summary: "Get all input returns" })
  @ApiResponse({ status: 200, description: "List of input returns" })
  findAllInputReturns() {
    return this.producersService.findAllInputReturns()
  }

  @Get("input-assignments/all")
  @ApiOperation({ summary: "Get all input assignments" })
  @ApiResponse({ status: 200, description: "List of input assignments" })
  findAllInputAssignments() {
    return this.producersService.findAllInputAssignments()
  }

  @Patch("input-assignments/:id")
  @ApiOperation({ summary: "Update input assignment" })
  @ApiResponse({ status: 200, description: "Input assignment updated" })
  updateInputAssignment(@Param("id", ParseUUIDPipe) id: string, @Body() dto: CreateInputAssignmentDto) {
    return this.producersService.updateInputAssignment(id, dto)
  }

  @Delete("input-assignments/:id")
  @ApiOperation({ summary: "Delete input assignment" })
  @ApiResponse({ status: 200, description: "Input assignment deleted" })
  deleteInputAssignment(@Param("id", ParseUUIDPipe) id: string) {
    return this.producersService.deleteInputAssignment(id)
  }

  @Post("fruit-receptions")
  @ApiOperation({ summary: "Create fruit reception" })
  @ApiResponse({ status: 201, description: "Fruit reception created" })
  createFruitReception(@Body() dto: CreateFruitReceptionDto) {
    return this.producersService.createFruitReception(dto)
  }

  @Get("fruit-receptions/all")
  @ApiOperation({ summary: "Get all fruit receptions" })
  @ApiResponse({ status: 200, description: "List of fruit receptions" })
  findAllFruitReceptions() {
    return this.producersService.findAllFruitReceptions()
  }

  @Patch("fruit-receptions/:id")
  @ApiOperation({ summary: "Update fruit reception" })
  @ApiResponse({ status: 200, description: "Fruit reception updated" })
  updateFruitReception(@Param("id", ParseUUIDPipe) id: string, @Body() dto: CreateFruitReceptionDto) {
    return this.producersService.updateFruitReception(id, dto)
  }

  @Delete("fruit-receptions/:id")
  @ApiOperation({ summary: "Delete fruit reception" })
  @ApiResponse({ status: 200, description: "Fruit reception deleted" })
  deleteFruitReception(@Param("id", ParseUUIDPipe) id: string) {
    return this.producersService.deleteFruitReception(id)
  }

  @Post("shipments")
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'shipmentInvoiceFile', maxCount: 1 },
    { name: 'carrierInvoiceFile', maxCount: 1 },
    { name: 'waybillFile', maxCount: 1 },
  ], { storage: multer.memoryStorage() }))
  @ApiOperation({ summary: "Create shipment" })
  @ApiResponse({ status: 201, description: "Shipment created" })
  async createShipment(@UploadedFiles() files: Record<string, any[]>, @Body() dto: CreateShipmentDto) {
    // Save files to uploads and attach URLs to DTO
    const saved = await saveFilesToUploads(files)
    if (saved.shipmentInvoiceFile) dto.invoiceUrl = saved.shipmentInvoiceFile
    if (saved.carrierInvoiceFile) dto.carrierInvoiceUrl = saved.carrierInvoiceFile
    if (saved.waybillFile) dto.waybillUrl = saved.waybillFile
    return this.producersService.createShipment(dto)
  }

  @Get("shipments/all")
  @ApiOperation({ summary: "Get all shipments" })
  @ApiResponse({ status: 200, description: "List of shipments" })
  findAllShipments() {
    return this.producersService.findAllShipments()
  }

  @Patch("shipments/:id/status")
  @ApiOperation({ summary: "Update shipment status" })
  @ApiResponse({ status: 200, description: "Shipment status updated" })
  updateShipmentStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: 'embarcada' | 'recibida' | 'vendida',
    @Body('salePrice') salePrice?: number,
  ) {
    return this.producersService.updateShipmentStatus(id, status, salePrice)
  }

  @Patch("shipments/:id")
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'shipmentInvoiceFile', maxCount: 1 },
    { name: 'carrierInvoiceFile', maxCount: 1 },
    { name: 'waybillFile', maxCount: 1 },
  ], { storage: multer.memoryStorage() }))
  @ApiOperation({ summary: "Update shipment" })
  @ApiResponse({ status: 200, description: "Shipment updated" })
  async updateShipment(@Param("id", ParseUUIDPipe) id: string, @UploadedFiles() files: Record<string, any[]>, @Body() dto: Partial<CreateShipmentDto>) {
    try {
      console.log('[producers] updateShipment called', { id, files: Object.keys(files || {}), dtoProvided: Object.keys(dto || {}) })
    } catch (e) {
      // ignore logging errors
    }
    const saved = await saveFilesToUploads(files)
    if (saved.shipmentInvoiceFile) dto.invoiceUrl = saved.shipmentInvoiceFile
    if (saved.carrierInvoiceFile) dto.carrierInvoiceUrl = saved.carrierInvoiceFile
    if (saved.waybillFile) dto.waybillUrl = saved.waybillFile
    return this.producersService.updateShipment(id, dto)
  }

  @Delete("shipments/:id")
  @ApiOperation({ summary: "Delete shipment" })
  @ApiResponse({ status: 200, description: "Shipment deleted" })
  deleteShipment(@Param("id", ParseUUIDPipe) id: string) {
    return this.producersService.deleteShipment(id)
  }

  @Get(':id/account-statement')
  @ApiOperation({ summary: 'Get producer account statement' })
  @ApiResponse({ status: 200, description: 'Account statement' })
  getAccountStatement(@Param('id', ParseUUIDPipe) id: string) {
    return this.producersService.getAccountStatement(id);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get complete producer report for printing/delivery' })
  @ApiResponse({ status: 200, description: 'Complete producer report' })
  getProducerReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.producersService.getProducerReport(id);
  }

  @Post("payments")
  @ApiOperation({ summary: "Create payment" })
  @ApiResponse({ status: 201, description: "Payment created" })
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.producersService.createPayment(dto)
  }

  @Post("payment-reports")
  @ApiOperation({ summary: "Create payment report" })
  @ApiResponse({ status: 201, description: "Payment report created" })
  createPaymentReport(@Body() dto: CreatePaymentReportDto) {
    return this.producersService.createPaymentReport(dto)
  }

  @Get("payment-reports/all")
  @ApiOperation({ summary: "Get all payment reports" })
  @ApiResponse({ status: 200, description: "List of payment reports" })
  findAllPaymentReports() {
    return this.producersService.findAllPaymentReports()
  }

  @Get("payment-reports/:id")
  @ApiOperation({ summary: "Get payment report by ID" })
  @ApiResponse({ status: 200, description: "Payment report details" })
  findOnePaymentReport(@Param("id", ParseUUIDPipe) id: string) {
    return this.producersService.findOnePaymentReport(id)
  }

  @Patch("payment-reports/:id")
  @ApiOperation({ summary: "Update payment report" })
  @ApiResponse({ status: 200, description: "Payment report updated" })
  updatePaymentReport(@Param("id", ParseUUIDPipe) id: string, @Body() dto: CreatePaymentReportDto) {
    return this.producersService.updatePaymentReport(id, dto)
  }

  @Patch("payment-reports/:id/status")
  @ApiOperation({ summary: "Update payment report status" })
  @ApiResponse({ status: 200, description: "Payment report status updated" })
  updatePaymentReportStatus(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentReportStatusDto) {
    return this.producersService.updatePaymentReportStatus(id, dto)
  }

  @Delete("payment-reports/:id")
  @ApiOperation({ summary: "Delete payment report" })
  @ApiResponse({ status: 200, description: "Payment report deleted" })
  deletePaymentReport(@Param("id", ParseUUIDPipe) id: string) {
    return this.producersService.deletePaymentReport(id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a producer" })
  @ApiResponse({ status: 200, description: "Producer updated successfully" })
  async updateProducer(@Param("id", ParseUUIDPipe) id: string, @Body() updateProducerDto: UpdateProducerDto) {
    return this.producersService.updateProducer(id, updateProducerDto)
  }
}
