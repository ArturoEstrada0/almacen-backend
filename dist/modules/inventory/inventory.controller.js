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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const create_movement_dto_1 = require("./dto/create-movement.dto");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getInventory(warehouseId) {
        return this.inventoryService.getInventory(warehouseId);
    }
    getInventoryByProduct(productId) {
        return this.inventoryService.getInventoryByProduct(productId);
    }
    getInventoryByWarehouse(id) {
        return this.inventoryService.getInventory(id);
    }
    createMovement(createMovementDto) {
        return this.inventoryService.createMovement(createMovementDto);
    }
    updateInventory(productId, body) {
        return this.inventoryService.updateInventorySettings(productId, body);
    }
    updateInventoryCompat(productId, body) {
        return this.inventoryService.updateInventorySettings(productId, body);
    }
    getMovements(warehouseId) {
        return this.inventoryService.getMovements(warehouseId);
    }
    getMovement(id) {
        return this.inventoryService.getMovement(id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get inventory items" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of inventory items" }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory by product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory items for product' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getInventoryByProduct", null);
__decorate([
    (0, common_1.Get)('warehouse/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory items for a warehouse' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory items for the given warehouse' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getInventoryByWarehouse", null);
__decorate([
    (0, common_1.Post)('movements'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new inventory movement' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Movement created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_movement_dto_1.CreateMovementDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createMovement", null);
__decorate([
    (0, common_1.Patch)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inventory settings for a product in a warehouse' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item updated' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateInventory", null);
__decorate([
    (0, common_1.Patch)('product/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inventory settings for a product in a warehouse (compat)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item updated' }),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateInventoryCompat", null);
__decorate([
    (0, common_1.Get)("movements"),
    (0, swagger_1.ApiOperation)({ summary: "Get all movements" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of movements" }),
    __param(0, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Get)('movements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a movement by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Movement details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovement", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)("inventory"),
    (0, common_1.Controller)("inventory"),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map