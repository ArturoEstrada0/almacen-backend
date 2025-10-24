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
exports.CreateMovementDto = exports.CreateMovementItemDto = exports.MovementType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var MovementType;
(function (MovementType) {
    MovementType["ENTRADA"] = "entrada";
    MovementType["SALIDA"] = "salida";
    MovementType["AJUSTE"] = "ajuste";
    MovementType["TRASPASO"] = "traspaso";
})(MovementType || (exports.MovementType = MovementType = {}));
class CreateMovementItemDto {
}
exports.CreateMovementItemDto = CreateMovementItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMovementItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateMovementItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMovementItemDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Notas adicionales", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMovementItemDto.prototype, "notes", void 0);
class CreateMovementDto {
}
exports.CreateMovementDto = CreateMovementDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MovementType, example: MovementType.ENTRADA }),
    (0, class_validator_1.IsEnum)(MovementType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "destinationWarehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Recepción de mercancía", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Notas del movimiento", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMovementDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateMovementItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateMovementItemDto),
    __metadata("design:type", Array)
], CreateMovementDto.prototype, "items", void 0);
//# sourceMappingURL=create-movement.dto.js.map