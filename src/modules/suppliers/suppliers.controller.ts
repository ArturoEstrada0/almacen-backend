import { Controller, Get, Post, Patch, Param, Delete, ParseUUIDPipe, Body, Req, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { SuppliersService } from "./suppliers.service"
import type { Request } from 'express'
import { CreateSupplierDto } from "./dto/create-supplier.dto"
import { UpdateSupplierDto } from "./dto/update-supplier.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"

@ApiTags("suppliers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Crear nuevo proveedor" })
  @ApiResponse({ status: 201, description: "Proveedor creado exitosamente" })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto)
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los proveedores" })
  @ApiResponse({ status: 200, description: "Lista de proveedores" })
  findAll(@Query("supplierType") supplierType?: string) {
    return this.suppliersService.findAll(supplierType)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Datos del proveedor' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id)
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Obtener productos asociados a un proveedor' })
  @ApiResponse({ status: 200, description: 'Lista de productos del proveedor' })
  getProducts(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.getProducts(id)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Actualizar proveedor" })
  @ApiResponse({ status: 200, description: "Proveedor actualizado exitosamente" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: 'Eliminar proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor eliminado exitosamente' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.suppliersService.remove(id, req as any)
  }
}
