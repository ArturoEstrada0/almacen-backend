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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PERMISSIONS = exports.UserPermissionsDto = exports.ModulePermissions = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ModulePermissions {
    constructor() {
        this.create = false;
        this.read = false;
        this.update = false;
        this.delete = false;
    }
}
exports.ModulePermissions = ModulePermissions;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ModulePermissions.prototype, "create", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ModulePermissions.prototype, "read", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ModulePermissions.prototype, "update", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ModulePermissions.prototype, "delete", void 0);
class UserPermissionsDto {
}
exports.UserPermissionsDto = UserPermissionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "products", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "inventory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "movements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "suppliers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "purchaseOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "warehouses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "producers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "reports", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ModulePermissions, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ModulePermissions),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ModulePermissions)
], UserPermissionsDto.prototype, "users", void 0);
exports.DEFAULT_PERMISSIONS = {
    admin: {
        products: { create: true, read: true, update: true, delete: true },
        inventory: { create: true, read: true, update: true, delete: true },
        movements: { create: true, read: true, update: true, delete: true },
        suppliers: { create: true, read: true, update: true, delete: true },
        purchaseOrders: { create: true, read: true, update: true, delete: true },
        warehouses: { create: true, read: true, update: true, delete: true },
        producers: { create: true, read: true, update: true, delete: true },
        reports: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true },
    },
    manager: {
        products: { create: true, read: true, update: true, delete: false },
        inventory: { create: true, read: true, update: true, delete: false },
        movements: { create: true, read: true, update: true, delete: false },
        suppliers: { create: true, read: true, update: true, delete: false },
        purchaseOrders: { create: true, read: true, update: true, delete: false },
        warehouses: { create: false, read: true, update: false, delete: false },
        producers: { create: true, read: true, update: true, delete: false },
        reports: { create: true, read: true, update: false, delete: false },
        users: { create: false, read: true, update: false, delete: false },
    },
    operator: {
        products: { create: false, read: true, update: true, delete: false },
        inventory: { create: false, read: true, update: true, delete: false },
        movements: { create: true, read: true, update: false, delete: false },
        suppliers: { create: false, read: true, update: false, delete: false },
        purchaseOrders: { create: false, read: true, update: true, delete: false },
        warehouses: { create: false, read: true, update: false, delete: false },
        producers: { create: false, read: true, update: true, delete: false },
        reports: { create: false, read: true, update: false, delete: false },
        users: { create: false, read: false, update: false, delete: false },
    },
    viewer: {
        products: { create: false, read: true, update: false, delete: false },
        inventory: { create: false, read: true, update: false, delete: false },
        movements: { create: false, read: true, update: false, delete: false },
        suppliers: { create: false, read: true, update: false, delete: false },
        purchaseOrders: { create: false, read: true, update: false, delete: false },
        warehouses: { create: false, read: true, update: false, delete: false },
        producers: { create: false, read: true, update: false, delete: false },
        reports: { create: false, read: true, update: false, delete: false },
        users: { create: false, read: false, update: false, delete: false },
    },
};
//# sourceMappingURL=user-permissions.dto.js.map