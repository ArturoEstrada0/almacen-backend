import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { ProducersService } from "./producers.service"
import { CreateProducerDto } from "./dto/create-producer.dto"
import { CreateInputAssignmentDto } from "./dto/create-input-assignment.dto"
import { CreateFruitReceptionDto } from "./dto/create-fruit-reception.dto"
import { CreateShipmentDto } from "./dto/create-shipment.dto"
import { CreatePaymentDto } from "./dto/create-payment.dto"
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

  @Get("input-assignments/all")
  @ApiOperation({ summary: "Get all input assignments" })
  @ApiResponse({ status: 200, description: "List of input assignments" })
  findAllInputAssignments() {
    return this.producersService.findAllInputAssignments()
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

  @Post("shipments")
  @ApiOperation({ summary: "Create shipment" })
  @ApiResponse({ status: 201, description: "Shipment created" })
  createShipment(@Body() dto: CreateShipmentDto) {
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

  @Get(':id/account-statement')
  @ApiOperation({ summary: 'Get producer account statement' })
  @ApiResponse({ status: 200, description: 'Account statement' })
  getAccountStatement(@Param('id', ParseUUIDPipe) id: string) {
    return this.producersService.getAccountStatement(id);
  }

  @Post("payments")
  @ApiOperation({ summary: "Create payment" })
  @ApiResponse({ status: 201, description: "Payment created" })
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.producersService.createPayment(dto)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a producer" })
  @ApiResponse({ status: 200, description: "Producer updated successfully" })
  async updateProducer(@Param("id", ParseUUIDPipe) id: string, @Body() updateProducerDto: UpdateProducerDto) {
    return this.producersService.updateProducer(id, updateProducerDto)
  }
}
