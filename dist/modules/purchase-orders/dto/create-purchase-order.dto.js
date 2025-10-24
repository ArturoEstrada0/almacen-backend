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
exports.CreatePurchaseOrderDto = exports.CreatePurchaseOrderItemDto = exports.PurchaseOrderStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["PENDING"] = "pending";
    PurchaseOrderStatus["PARTIAL"] = "partial";
    PurchaseOrderStatus["COMPLETED"] = "completed";
    PurchaseOrderStatus["CANCELLED"] = "cancelled";
})(PurchaseOrderStatus || (exports.PurchaseOrderStatus = PurchaseOrderStatus = {}));
class CreatePurchaseOrderItemDto {
}
exports.CreatePurchaseOrderItemDto = CreatePurchaseOrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePurchaseOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePurchaseOrderItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Notas del producto", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePurchaseOrderItemDto.prototype, "notes", void 0);
class CreatePurchaseOrderDto {
}
exports.CreatePurchaseOrderDto = CreatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PO-2024-001", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "orderNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2024-12-31", required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreatePurchaseOrderDto.prototype, "expectedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Notas de la orden", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreatePurchaseOrderItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePurchaseOrderItemDto),
    __metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "items", void 0);
//# sourceMappingURL=create-purchase-order.dto.js.map