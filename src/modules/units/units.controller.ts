import { Controller, Get, Param } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Unit } from "./entities/unit.entity"

@ApiTags("units")
@Controller("units")
export class UnitsController {
  constructor(@InjectRepository(Unit) private unitsRepo: Repository<Unit>) {}

  @Get()
  async findAll() {
    return await this.unitsRepo.find({ order: { name: "ASC" } })
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.unitsRepo.findOne({ where: { id } })
  }
}
