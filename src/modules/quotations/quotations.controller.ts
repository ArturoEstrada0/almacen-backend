import { Controller, Get, Post, Param, Patch, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { SendQuotationEmailDto } from './dto/send-quotation-email.dto';
import { SubmitSupplierResponseDto } from './dto/submit-supplier-response.dto';

@ApiTags('quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cotización' })
  @ApiResponse({ status: 201, description: 'Cotización creada exitosamente' })
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cotizaciones' })
  @ApiResponse({ status: 200, description: 'Lista de cotizaciones' })
  findAll() {
    return this.quotationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cotización por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la cotización' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.findOne(id);
  }

  @Get(':id/comparison')
  @ApiOperation({ summary: 'Obtener comparación de precios de proveedores' })
  @ApiResponse({ status: 200, description: 'Comparación de cotizaciones' })
  getComparison(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.getQuotationComparison(id);
  }

  @Post(':id/send-emails')
  @ApiOperation({ summary: 'Enviar correos a proveedores' })
  @ApiResponse({ status: 200, description: 'Resultado del envío de correos' })
  sendEmails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() sendEmailDto: SendQuotationEmailDto,
  ) {
    return this.quotationsService.sendEmailToSuppliers(id, sendEmailDto.supplierIds);
  }

  @Post(':id/send-all-emails')
  @ApiOperation({ summary: 'Enviar correos a todos los proveedores' })
  @ApiResponse({ status: 200, description: 'Resultado del envío de correos' })
  sendAllEmails(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.sendEmailToSuppliers(id);
  }

  @Patch(':id/winner/:supplierId')
  @ApiOperation({ summary: 'Marcar proveedor como ganador' })
  @ApiResponse({ status: 200, description: 'Ganador marcado exitosamente' })
  markAsWinner(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
  ) {
    return this.quotationsService.markAsWinner(id, supplierId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar cotización' })
  @ApiResponse({ status: 200, description: 'Cotización cancelada' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.cancel(id);
  }

  // ========== ENDPOINTS PÚBLICOS PARA EL PORTAL DE PROVEEDORES ==========

  @Get('portal/:id')
  @ApiOperation({ summary: 'Obtener cotización para proveedor (portal público)' })
  @ApiQuery({ name: 'token', required: true, description: 'Token de acceso del proveedor' })
  @ApiResponse({ status: 200, description: 'Datos de la cotización para el proveedor' })
  getQuotationForSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('token') token: string,
  ) {
    return this.quotationsService.getQuotationForSupplier(id, token);
  }

  @Post('portal/:id/respond')
  @ApiOperation({ summary: 'Enviar respuesta del proveedor (portal público)' })
  @ApiQuery({ name: 'token', required: true, description: 'Token de acceso del proveedor' })
  @ApiResponse({ status: 200, description: 'Respuesta enviada exitosamente' })
  submitSupplierResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('token') token: string,
    @Body() responseDto: SubmitSupplierResponseDto,
  ) {
    return this.quotationsService.submitSupplierResponse(id, token, responseDto);
  }
}
