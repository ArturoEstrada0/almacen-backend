import { Controller, Get, Post, Body, Param, Patch, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { PurchaseOrdersService } from "./purchase-orders.service"
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto"

@ApiTags("purchase-orders")
@Controller("purchase-orders")
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new purchase order" })
  @ApiResponse({ status: 201, description: "Purchase order created successfully" })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all purchase orders" })
  @ApiResponse({ status: 200, description: "List of purchase orders" })
  findAll() {
    return this.purchaseOrdersService.findAll()
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
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.cancel(id);
  }
}
