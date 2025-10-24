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
exports.WarehousesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const warehouses_service_1 = require("./warehouses.service");
const create_warehouse_dto_1 = require("./dto/create-warehouse.dto");
const update_warehouse_dto_1 = require("./dto/update-warehouse.dto");
const create_location_dto_1 = require("./dto/create-location.dto");
let WarehousesController = class WarehousesController {
    constructor(warehousesService) {
        this.warehousesService = warehousesService;
    }
    create(createWarehouseDto) {
        return this.warehousesService.create(createWarehouseDto);
    }
    findAll() {
        return this.warehousesService.findAll();
    }
    findOne(id) {
        return this.warehousesService.findOne(id);
    }
    update(id, updateWarehouseDto) {
        return this.warehousesService.update(id, updateWarehouseDto);
    }
    remove(id) {
        return this.warehousesService.remove(id);
    }
    createLocation(createLocationDto) {
        return this.warehousesService.createLocation(createLocationDto);
    }
    findAllLocations(warehouseId) {
        return this.warehousesService.findAllLocations(warehouseId);
    }
    removeLocation(id) {
        return this.warehousesService.removeLocation(id);
    }
};
exports.WarehousesController = WarehousesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new warehouse" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Warehouse created successfully" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_warehouse_dto_1.CreateWarehouseDto]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all warehouses" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of warehouses" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a warehouse by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Warehouse details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Warehouse not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update a warehouse" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Warehouse updated successfully" }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_warehouse_dto_1.UpdateWarehouseDto]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a warehouse' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Warehouse deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)("locations"),
    (0, swagger_1.ApiOperation)({ summary: "Create a new location" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Location created successfully" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_location_dto_1.CreateLocationDto]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Get)('locations/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all locations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of locations' }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "findAllLocations", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a location' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location deleted successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "removeLocation", null);
exports.WarehousesController = WarehousesController = __decorate([
    (0, swagger_1.ApiTags)("warehouses"),
    (0, common_1.Controller)("warehouses"),
    __metadata("design:paramtypes", [warehouses_service_1.WarehousesService])
], WarehousesController);
//# sourceMappingURL=warehouses.controller.js.map