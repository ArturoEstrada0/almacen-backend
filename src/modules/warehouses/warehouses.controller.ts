import { Controller, Get, Post, Patch, Param, Delete, Query, ParseUUIDPipe, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { WarehousesService } from "./warehouses.service"
import { CreateWarehouseDto } from "./dto/create-warehouse.dto"
import { UpdateWarehouseDto } from "./dto/update-warehouse.dto"
import { CreateLocationDto } from "./dto/create-location.dto"

@ApiTags("warehouses")
@Controller("warehouses")
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new warehouse" })
  @ApiResponse({ status: 201, description: "Warehouse created successfully" })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all warehouses" })
  @ApiResponse({ status: 200, description: "List of warehouses" })
  findAll() {
    return this.warehousesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Warehouse details' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a warehouse" })
  @ApiResponse({ status: 200, description: "Warehouse updated successfully" })
  update(@Param('id', ParseUUIDPipe) id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, updateWarehouseDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.remove(id);
  }

  @Post("locations")
  @ApiOperation({ summary: "Create a new location" })
  @ApiResponse({ status: 201, description: "Location created successfully" })
  createLocation(createLocationDto: CreateLocationDto) {
    return this.warehousesService.createLocation(createLocationDto)
  }

  @Get('locations/all')
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'List of locations' })
  findAllLocations(@Query('warehouseId') warehouseId?: string) {
    return this.warehousesService.findAllLocations(warehouseId);
  }

  @Delete('locations/:id')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  removeLocation(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.removeLocation(id);
  }
}
