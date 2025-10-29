import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import * as multer from "multer"
import { ImportsService } from "./imports.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

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
}
