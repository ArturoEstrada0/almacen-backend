import { Controller, Get, Post, Patch, Param, Delete, ParseUUIDPipe, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { SuppliersService } from "./suppliers.service"
import { CreateSupplierDto } from "./dto/create-supplier.dto"
import { UpdateSupplierDto } from "./dto/update-supplier.dto"

@ApiTags("suppliers")
@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new supplier" })
  @ApiResponse({ status: 201, description: "Supplier created successfully" })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all suppliers" })
  @ApiResponse({ status: 200, description: "List of suppliers" })
  findAll() {
    return this.suppliersService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a supplier" })
  @ApiResponse({ status: 200, description: "Supplier updated successfully" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id);
  }
}
