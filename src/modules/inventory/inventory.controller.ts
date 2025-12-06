import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, Patch } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { InventoryService } from "./inventory.service"
import { CreateMovementDto } from "./dto/create-movement.dto"

@ApiTags("inventory")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: "Get inventory items" })
  @ApiResponse({ status: 200, description: "List of inventory items" })
  getInventory(@Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getInventory(warehouseId)
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: 200, description: 'List of products with low stock' })
  getLowStockProducts(@Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getLowStockProducts(warehouseId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product' })
  @ApiResponse({ status: 200, description: 'Inventory items for product' })
  getInventoryByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getInventoryByProduct(productId);
  }

  @Get('warehouse/:id')
  @ApiOperation({ summary: 'Get inventory items for a warehouse' })
  @ApiResponse({ status: 200, description: 'Inventory items for the given warehouse' })
  getInventoryByWarehouse(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getInventory(id)
  }

  @Post('movements')
  @ApiOperation({ summary: 'Create a new inventory movement' })
  @ApiResponse({ status: 201, description: 'Movement created successfully' })
  createMovement(@Body() createMovementDto: CreateMovementDto) {
    return this.inventoryService.createMovement(createMovementDto);
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update inventory settings for a product in a warehouse' })
  @ApiResponse({ status: 200, description: 'Inventory item updated' })
  updateInventory(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { 
      warehouseId: string
      quantity?: number
      minStock?: number
      maxStock?: number
      reorderPoint?: number
      locationId?: string
      lotNumber?: string
      expirationDate?: Date | string
    },
  ) {
    return this.inventoryService.updateInventorySettings(productId, body)
  }

  // Backwards-compatible route: support PATCH /inventory/product/:productId as well
  @Patch('product/:productId')
  @ApiOperation({ summary: 'Update inventory settings for a product in a warehouse (compat)' })
  @ApiResponse({ status: 200, description: 'Inventory item updated' })
  updateInventoryCompat(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { 
      warehouseId: string
      quantity?: number
      minStock?: number
      maxStock?: number
      reorderPoint?: number
      locationId?: string
      lotNumber?: string
      expirationDate?: Date | string
    },
  ) {
    return this.inventoryService.updateInventorySettings(productId, body)
  }

  @Get("movements")
  @ApiOperation({ summary: "Get all movements" })
  @ApiResponse({ status: 200, description: "List of movements" })
  getMovements(@Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getMovements(warehouseId)
  }

  @Get('movements/:id')
  @ApiOperation({ summary: 'Get a movement by ID' })
  @ApiResponse({ status: 200, description: 'Movement details' })
  getMovement(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.getMovement(id);
  }
}
