import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Unit } from "./entities/unit.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  exports: [TypeOrmModule],
})
export class UnitsModule {}
