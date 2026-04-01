import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { TraceabilityService } from "./traceability.service"

@ApiTags("traceability")
@Controller("traceability")
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  @Get(":entityType/:entityId")
  @ApiOperation({ summary: "Get traceability events for an entity" })
  @ApiResponse({ status: 200, description: "Traceability history" })
  getHistory(@Param("entityType") entityType: string, @Param("entityId", ParseUUIDPipe) entityId: string) {
    return this.traceabilityService.findByEntity(entityType, entityId)
  }
}