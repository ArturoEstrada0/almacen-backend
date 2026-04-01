import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TraceabilityController } from "./traceability.controller"
import { TraceabilityEvent } from "./entities/traceability-event.entity"
import { TraceabilityService } from "./traceability.service"

@Module({
  imports: [TypeOrmModule.forFeature([TraceabilityEvent])],
  controllers: [TraceabilityController],
  providers: [TraceabilityService],
  exports: [TraceabilityService],
})
export class TraceabilityModule {}