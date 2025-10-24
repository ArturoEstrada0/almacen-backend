import { Controller, Get, Post, Param, Patch, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { QuotationsService } from "./quotations.service"
import { CreateQuotationDto } from "./dto/create-quotation.dto"

@ApiTags("quotations")
@Controller("quotations")
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new quotation" })
  @ApiResponse({ status: 201, description: "Quotation created successfully" })
  create(createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all quotations" })
  @ApiResponse({ status: 200, description: "List of quotations" })
  findAll() {
    return this.quotationsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quotation by ID' })
  @ApiResponse({ status: 200, description: 'Quotation details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.findOne(id);
  }

  @Patch(":id/winner/:supplierId")
  @ApiOperation({ summary: "Mark supplier as winner" })
  @ApiResponse({ status: 200, description: "Winner marked successfully" })
  markAsWinner(@Param('id', ParseUUIDPipe) id: string, @Param('supplierId', ParseUUIDPipe) supplierId: string) {
    return this.quotationsService.markAsWinner(id, supplierId)
  }
}
