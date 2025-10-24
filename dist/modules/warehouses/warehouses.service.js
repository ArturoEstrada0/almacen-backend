"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const warehouse_entity_1 = require("./entities/warehouse.entity");
const location_entity_1 = require("./entities/location.entity");
let WarehousesService = class WarehousesService {
    constructor(warehousesRepository, locationsRepository) {
        this.warehousesRepository = warehousesRepository;
        this.locationsRepository = locationsRepository;
    }
    async create(createWarehouseDto) {
        const warehouse = this.warehousesRepository.create(createWarehouseDto);
        return await this.warehousesRepository.save(warehouse);
    }
    async findAll() {
        return await this.warehousesRepository.find({
            relations: ["locations", "inventoryItems"],
            order: { name: "ASC" },
        });
    }
    async findOne(id) {
        const warehouse = await this.warehousesRepository.findOne({
            where: { id },
            relations: ["locations", "inventoryItems", "inventoryItems.product"],
        });
        if (!warehouse) {
            throw new common_1.NotFoundException(`Warehouse with ID ${id} not found`);
        }
        return warehouse;
    }
    async update(id, updateWarehouseDto) {
        const warehouse = await this.findOne(id);
        Object.assign(warehouse, updateWarehouseDto);
        return await this.warehousesRepository.save(warehouse);
    }
    async remove(id) {
        const warehouse = await this.findOne(id);
        await this.warehousesRepository.remove(warehouse);
    }
    async createLocation(createLocationDto) {
        const location = this.locationsRepository.create(createLocationDto);
        return await this.locationsRepository.save(location);
    }
    async findAllLocations(warehouseId) {
        const where = warehouseId ? { warehouseId } : {};
        return await this.locationsRepository.find({
            where,
            relations: ["warehouse"],
            order: { zone: "ASC", aisle: "ASC" },
        });
    }
    async findOneLocation(id) {
        const location = await this.locationsRepository.findOne({
            where: { id },
            relations: ["warehouse"],
        });
        if (!location) {
            throw new common_1.NotFoundException(`Location with ID ${id} not found`);
        }
        return location;
    }
    async removeLocation(id) {
        const location = await this.findOneLocation(id);
        await this.locationsRepository.remove(location);
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(warehouse_entity_1.Warehouse)),
    __param(1, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __metadata("design:paramtypes", [Function, Function])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map