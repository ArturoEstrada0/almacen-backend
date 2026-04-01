import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { TraceabilityEvent } from "./entities/traceability-event.entity"

@Injectable()
export class TraceabilityService {
  constructor(
    @InjectRepository(TraceabilityEvent)
    private readonly traceabilityRepository: Repository<TraceabilityEvent>,
  ) {}

  async record(params: {
    entityType: string
    entityId: string
    action: string
    userId?: string
    userName?: string
    reason?: string
    details?: any
    result?: string
  }): Promise<void> {
    try {
      const event = this.traceabilityRepository.create({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId || null,
        userName: params.userName || null,
        reason: params.reason || null,
        details: params.details !== undefined && params.details !== null ? JSON.stringify(params.details) : null,
        result: params.result || "success",
      })

      await this.traceabilityRepository.save(event)
    } catch {
      // Trazabilidad no debe romper la operación principal
    }
  }

  async findByEntity(entityType: string, entityId: string): Promise<TraceabilityEvent[]> {
    return this.traceabilityRepository.find({
      where: { entityType, entityId },
      order: { createdAt: "DESC" },
    })
  }
}