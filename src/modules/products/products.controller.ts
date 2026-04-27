import { Controller, Get, Post, Patch, Param, Delete, Query, UseGuards, Body, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { AddProductSupplierDto, UpdateProductSupplierDto } from "./dto/add-product-supplier.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"

@ApiTags("products")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Crear nuevo producto" })
  @ApiResponse({ status: 201, description: "Producto creado exitosamente" })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los productos" })
  @ApiResponse({ status: 200, description: "Lista de productos" })
  findAll(
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.productsService.findAll({ type, categoryId, active, search, supplierId })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Actualizar producto" })
  @ApiResponse({ status: 200, description: "Producto actualizado" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id)
  }

  @Post(":id/suppliers")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Asociar proveedor a producto" })
  @ApiResponse({ status: 201, description: "Proveedor asociado al producto" })
  addSupplier(@Param('id', ParseUUIDPipe) productId: string, @Body() dto: AddProductSupplierDto) {
    return this.productsService.addSupplier(productId, dto)
  }

  @Get(':id/suppliers')
  @ApiOperation({ summary: 'Obtener proveedores de un producto' })
  getSuppliers(@Param('id', ParseUUIDPipe) productId: string) {
    return this.productsService.getSuppliers(productId)
  }

  @Patch(":id/suppliers/:supplierId")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Actualizar relación producto-proveedor" })
  updateProductSupplier(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('supplierId', ParseUUIDPipe) productSupplierId: string,
    @Body() dto: UpdateProductSupplierDto,
  ) {
    return this.productsService.updateProductSupplier(productId, productSupplierId, dto)
  }

  @Delete(':id/suppliers/:supplierId')
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  @ApiOperation({ summary: "Desasociar proveedor de producto" })
  removeSupplier(
    @Param('id', ParseUUIDPipe) productId: string,
    @Param('supplierId', ParseUUIDPipe) productSupplierId: string,
  ) {
    return this.productsService.removeSupplier(productId, productSupplierId)
  }
}
