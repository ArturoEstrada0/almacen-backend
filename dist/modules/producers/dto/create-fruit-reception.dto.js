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
exports.CreateFruitReceptionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateFruitReceptionDto {
}
exports.CreateFruitReceptionDto = CreateFruitReceptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "producerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "warehouseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateFruitReceptionDto.prototype, "boxes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "TRK-MI6CT93L-5023", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "trackingFolio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2025-11-18", required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.5, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFruitReceptionDto.prototype, "weightPerBox", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2550, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFruitReceptionDto.prototype, "totalWeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Calidad A", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "quality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Notas de recepción", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFruitReceptionDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: "Cantidad de cajas devueltas por el productor", required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFruitReceptionDto.prototype, "returnedBoxes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500, description: "Valor del material de empaque devuelto (genera abono)", required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFruitReceptionDto.prototype, "returnedBoxesValue", void 0);
//# sourceMappingURL=create-fruit-reception.dto.js.map