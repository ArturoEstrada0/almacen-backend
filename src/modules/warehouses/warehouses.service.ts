import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Warehouse } from "./entities/warehouse.entity"
import { Location } from "./entities/location.entity"
import type { CreateWarehouseDto } from "./dto/create-warehouse.dto"
import type { UpdateWarehouseDto } from "./dto/update-warehouse.dto"
import type { CreateLocationDto } from "./dto/create-location.dto"

@Injectable()
export class WarehousesService {
  private warehousesRepository: Repository<Warehouse>
  private locationsRepository: Repository<Location>

  constructor(
    @InjectRepository(Warehouse)
    warehousesRepository: Repository<Warehouse>,
    @InjectRepository(Location)
    locationsRepository: Repository<Location>,
  ) {
    this.warehousesRepository = warehousesRepository
    this.locationsRepository = locationsRepository
  }

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehousesRepository.create(createWarehouseDto)
    return await this.warehousesRepository.save(warehouse)
  }

  async findAll(): Promise<Warehouse[]> {
    return await this.warehousesRepository.find({
      relations: ["locations", "inventoryItems"],
      order: { name: "ASC" },
    })
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findOne({
      where: { id },
      relations: ["locations", "inventoryItems", "inventoryItems.product"],
    })

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`)
    }

    return warehouse
  }

  async findByCode(code: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findOne({
      where: { code },
    })

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with code ${code} not found`)
    }

    return warehouse
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id)
    Object.assign(warehouse, updateWarehouseDto)
    return await this.warehousesRepository.save(warehouse)
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id)
    await this.warehousesRepository.remove(warehouse)
  }

  // Locations
  async createLocation(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationsRepository.create(createLocationDto)
    return await this.locationsRepository.save(location)
  }

  async findAllLocations(warehouseId?: string): Promise<Location[]> {
    const where = warehouseId ? { warehouseId } : {}
    return await this.locationsRepository.find({
      where,
      relations: ["warehouse"],
      order: { zone: "ASC", aisle: "ASC" },
    })
  }

  async findOneLocation(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({
      where: { id },
      relations: ["warehouse"],
    })

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`)
    }

    return location
  }

  async removeLocation(id: string): Promise<void> {
    const location = await this.findOneLocation(id)
    await this.locationsRepository.remove(location)
  }
}
