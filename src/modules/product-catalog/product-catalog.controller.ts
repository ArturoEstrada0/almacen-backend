import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { ProductCatalogService } from "./product-catalog.service"
import { CreateProductCatalogItemDto } from "./dto/create-product-catalog-item.dto"
import { UpdateProductCatalogItemDto } from "./dto/update-product-catalog-item.dto"
import { ProductCatalogItemStatus, ProductCatalogItemType } from "./entities/product-catalog-item.entity"

@ApiTags("product-catalog")
@ApiBearerAuth()
@Controller("product-catalog")
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) {}

  @Get()
  @ApiOperation({ summary: "Obtener catálogo completo" })
  findAll(
    @Query("type") type?: ProductCatalogItemType,
    @Query("status") status?: ProductCatalogItemStatus,
    @Query("search") search?: string,
  ) {
    return this.catalogService.findAll({ type, status, search })
  }

  @Get("active")
  @ApiOperation({ summary: "Obtener catálogo activo" })
  findActive(@Query("type") type?: ProductCatalogItemType) {
    return this.catalogService.findActive(type)
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener elemento por ID" })
  findOne(@Param("id") id: string) {
    return this.catalogService.findOne(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Crear elemento del catálogo" })
  @ApiResponse({ status: 201, description: "Elemento creado exitosamente" })
  create(@Body() dto: CreateProductCatalogItemDto) {
    return this.catalogService.create(dto)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Actualizar elemento del catálogo" })
  update(@Param("id") id: string, @Body() dto: UpdateProductCatalogItemDto) {
    return this.catalogService.update(id, dto)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Eliminar elemento del catálogo" })
  remove(@Param("id") id: string) {
    return this.catalogService.remove(id)
  }
}