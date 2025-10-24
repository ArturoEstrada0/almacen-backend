import { Controller, Get, Post, Patch, Param, Delete, Query, UseGuards, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { ProductsService } from "./products.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("products")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Crear nuevo producto" })
  @ApiResponse({ status: 201, description: "Producto creado exitosamente" })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los productos" })
  @ApiResponse({ status: 200, description: "Lista de productos" })
  findAll(
    @Query('type') type?: 'insumo' | 'fruta',
    @Query('categoryId') categoryId?: string,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({ type, categoryId, active, search })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar producto" })
  @ApiResponse({ status: 200, description: "Producto actualizado" })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(":id/suppliers")
  @ApiOperation({ summary: "Agregar proveedor a producto" })
  addSupplier(@Param('id') productId: string, @Body() supplierData: any) {
    return this.productsService.addSupplier(productId, supplierData)
  }

  @Get(':id/suppliers')
  @ApiOperation({ summary: 'Obtener proveedores de un producto' })
  getSuppliers(@Param('id') productId: string) {
    return this.productsService.getSuppliers(productId);
  }
}
