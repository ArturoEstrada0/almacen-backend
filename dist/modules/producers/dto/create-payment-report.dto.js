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
exports.UpdatePaymentReportStatusDto = exports.PaymentReportStatus = exports.CreatePaymentReportDto = exports.PaymentReportItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PaymentReportItemDto {
}
exports.PaymentReportItemDto = PaymentReportItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid-fruit-reception" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentReportItemDto.prototype, "fruitReceptionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentReportItemDto.prototype, "boxes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.50 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentReportItemDto.prototype, "pricePerBox", void 0);
class CreatePaymentReportDto {
}
exports.CreatePaymentReportDto = CreatePaymentReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: "uuid-producer" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentReportDto.prototype, "producerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "2025-11-20", required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentReportDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentReportItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PaymentReportItemDto),
    __metadata("design:type", Array)
], CreatePaymentReportDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.00, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePaymentReportDto.prototype, "retentionAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Retención por empaque", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentReportDto.prototype, "retentionNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Pago quincenal", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentReportDto.prototype, "notes", void 0);
var PaymentReportStatus;
(function (PaymentReportStatus) {
    PaymentReportStatus["PENDIENTE"] = "pendiente";
    PaymentReportStatus["PAGADO"] = "pagado";
    PaymentReportStatus["CANCELADO"] = "cancelado";
})(PaymentReportStatus || (exports.PaymentReportStatus = PaymentReportStatus = {}));
class UpdatePaymentReportStatusDto {
}
exports.UpdatePaymentReportStatusDto = UpdatePaymentReportStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PaymentReportStatus }),
    (0, class_validator_1.IsEnum)(PaymentReportStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "transfer", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "REF-12345", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "paymentReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Notas adicionales", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "https://.../invoice.pdf", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "invoiceUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "https://.../receipt.pdf", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "https://.../complement.pdf", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePaymentReportStatusDto.prototype, "paymentComplementUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.00, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePaymentReportStatusDto.prototype, "isrAmount", void 0);
//# sourceMappingURL=create-payment-report.dto.js.map