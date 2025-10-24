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
exports.CreateProducerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProducerDto {
}
exports.CreateProducerDto = CreateProducerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Juan Pérez" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProducerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "PROD-001" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProducerDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "juan@example.com", required: false }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProducerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "+52 123 456 7890", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProducerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Rancho La Esperanza", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProducerDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "RFC123456789", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProducerDto.prototype, "taxId", void 0);
//# sourceMappingURL=create-producer.dto.js.map