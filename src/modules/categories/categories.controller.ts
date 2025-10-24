import { Controller, Get, Param } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Category } from "./entities/category.entity"

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(@InjectRepository(Category) private categoriesRepo: Repository<Category>) {}

  @Get()
  async findAll() {
    return await this.categoriesRepo.find({ order: { name: "ASC" } })
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.categoriesRepo.findOne({ where: { id } })
  }
}
