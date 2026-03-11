import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { InvoiceImportService } from './invoice-import.service'

@Controller('invoice-import')
export class InvoiceImportController {
  constructor(private readonly service: InvoiceImportService) {}

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parse(@UploadedFile() file: any) {
    if (!file) return { lines: [] }
    return await this.service.parseXmlBuffer(file.buffer)
  }

  @Post('confirm')
  async confirm(@Body() body: any) {
    // body should follow CreatePurchaseOrderDto
    return await this.service.createPurchaseFromMapping(body)
  }
}
