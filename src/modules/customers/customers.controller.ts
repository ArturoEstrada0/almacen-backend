import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { CustomersService } from "./customers.service"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { UpdateCustomerDto } from "./dto/update-customer.dto"
import { Customer } from "./entities/customer.entity"

@ApiTags("customers")
@Controller("customers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Crear nuevo cliente
   * Solo administradores
   */
  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Crear nuevo cliente" })
  @ApiResponse({ status: 201, description: "Cliente creado exitosamente", type: Customer })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 409, description: "RFC o email duplicado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersService.create(createCustomerDto)
  }

  /**
   * Obtener todos los clientes
   * Solo administradores
   */
  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Obtener lista de todos los clientes" })
  @ApiResponse({ status: 200, description: "Lista de clientes", type: [Customer] })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findAll(): Promise<Customer[]> {
    return this.customersService.findAll()
  }

  /**
   * Obtener solo clientes activos
   * Solo administradores
   */
  @Get("active")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener lista de clientes activos" })
  @ApiResponse({ status: 200, description: "Lista de clientes activos", type: [Customer] })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findAllActive(): Promise<Customer[]> {
    return this.customersService.findAllActive()
  }

  /**
   * Buscar clientes por nombre, RFC o email
   * Solo administradores
   */
  @Get("search")
  @Roles("admin")
  @ApiOperation({ summary: "Buscar clientes por nombre, RFC o email" })
  @ApiResponse({ status: 200, description: "Clientes encontrados", type: [Customer] })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async search(@Query("q") query: string): Promise<Customer[]> {
    return this.customersService.search(query)
  }

  /**
   * Obtener cliente por ID
   * Solo administradores
   */
  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener cliente por ID" })
  @ApiResponse({ status: 200, description: "Detalles del cliente", type: Customer })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Customer> {
    return this.customersService.findOne(id)
  }

  /**
   * Obtener cliente por RFC
   * Solo administradores
   */
  @Get("rfc/:rfc")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener cliente por RFC" })
  @ApiResponse({ status: 200, description: "Detalles del cliente", type: Customer })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async findByRFC(@Param("rfc") rfc: string): Promise<Customer> {
    return this.customersService.findByRFC(rfc)
  }

  /**
   * Actualizar cliente
   * Solo administradores
   */
  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Actualizar datos del cliente" })
  @ApiResponse({ status: 200, description: "Cliente actualizado", type: Customer })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 409, description: "RFC o email duplicado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return this.customersService.update(id, updateCustomerDto)
  }

  /**
   * Cambiar estado de cliente (activo/inactivo)
   * Solo administradores
   */
  @Patch(":id/toggle-active")
  @Roles("admin")
  @ApiOperation({ summary: "Activar o desactivar cliente" })
  @ApiResponse({ status: 200, description: "Estado del cliente actualizado", type: Customer })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async toggleActive(@Param("id", ParseUUIDPipe) id: string): Promise<Customer> {
    return this.customersService.toggleActive(id)
  }

  /**
   * Eliminar cliente
   * Solo administradores
   */
  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Eliminar cliente" })
  @ApiResponse({ status: 200, description: "Cliente eliminado exitosamente" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 403, description: "No tiene permisos de administrador" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.customersService.remove(id)
  }
}
