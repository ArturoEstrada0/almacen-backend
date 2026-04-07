import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { AccountingService } from "./accounting.service"
import { RegisterShipmentPayableDto } from "./dto/register-shipment-payable.dto"

@ApiTags("accounting")
@Controller("accounting")
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get("shipments/payables")
  @ApiOperation({ summary: "Get shipment-generated accounts payable" })
  @ApiResponse({ status: 200, description: "List of shipment payables" })
  findShipmentPayables() {
    return this.accountingService.findShipmentPayables()
  }

  @Post("shipments/payables/:id/payment")
  @ApiOperation({ summary: "Register payment for a shipment payable" })
  @ApiResponse({ status: 200, description: "Shipment payable payment registered" })
  registerShipmentPayablePayment(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: RegisterShipmentPayableDto,
  ) {
    return this.accountingService.registerShipmentPayablePayment(id, dto)
  }
}
