import { Controller, Post, Get, Body, UseGuards, UseInterceptors, UploadedFile, Query, Res, Param } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import type { Response } from "express"
import * as multer from "multer"
import { ImportsService } from "./imports.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ExportProductsDto, ExportInventoryDto, ExportMovementsDto, ExportSuppliersDto, ExportFruitReceptionsDto } from "./dto/export-query.dto"

@ApiTags("imports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post()
  @ApiOperation({ summary: "Importar datos desde un archivo (XLSX/CSV)" })
  @UseInterceptors(FileInterceptor("file", { storage: multer.memoryStorage() }))
  async importFile(
    @UploadedFile() file: any,
    @Body('mapping') mapping: string,
    @Body('type') type: string,
    @Body('sheetName') sheetName?: string,
  ) {
    const parsedMapping = mapping ? JSON.parse(mapping) : {}
    return await this.importsService.importFile(file.buffer, parsedMapping, type, sheetName)
  }

  @Get("export/products")
  @ApiOperation({ summary: "Exportar productos a Excel/CSV" })
  async exportProducts(@Query() query: ExportProductsDto, @Res() res: Response) {
    const buffer = await this.importsService.exportProducts(query)
    const format = query.format || "xlsx"
    const filename = `productos_${new Date().toISOString().split("T")[0]}.${format}`
    
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }

  @Get("export/inventory")
  @ApiOperation({ summary: "Exportar inventario a Excel/CSV" })
  async exportInventory(@Query() query: ExportInventoryDto, @Res() res: Response) {
    const buffer = await this.importsService.exportInventory(query)
    const format = query.format || "xlsx"
    const filename = `inventario_${new Date().toISOString().split("T")[0]}.${format}`
    
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }

  @Get("export/movements")
  @ApiOperation({ summary: "Exportar movimientos a Excel/CSV" })
  async exportMovements(@Query() query: ExportMovementsDto, @Res() res: Response) {
    const buffer = await this.importsService.exportMovements(query)
    const format = query.format || "xlsx"
    const filename = `movimientos_${new Date().toISOString().split("T")[0]}.${format}`
    
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }

  @Get("export/suppliers")
  @ApiOperation({ summary: "Exportar proveedores a Excel/CSV" })
  async exportSuppliers(@Query() query: ExportSuppliersDto, @Res() res: Response) {
    const buffer = await this.importsService.exportSuppliers(query)
    const format = query.format || "xlsx"
    const filename = `proveedores_${new Date().toISOString().split("T")[0]}.${format}`
    
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }

  @Get("export/fruit-receptions")
  @ApiOperation({ summary: "Exportar recepciones de fruta a Excel/CSV" })
  async exportFruitReceptions(@Query() query: ExportFruitReceptionsDto, @Res() res: Response) {
    const buffer = await this.importsService.exportFruitReceptions(query)
    const format = query.format || "xlsx"
    const filename = `recepciones_fruta_${new Date().toISOString().split("T")[0]}.${format}`
    
    res.setHeader("Content-Type", format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }

  @Get("templates/:type")
  @ApiOperation({ summary: "Descargar plantilla de importación" })
  async downloadTemplate(@Param("type") type: string, @Res() res: Response) {
    const buffer = await this.importsService.generateTemplate(type)
    const filename = `plantilla_${type}.xlsx`
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(buffer)
  }
}
