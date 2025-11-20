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
exports.PaymentReport = void 0;
const typeorm_1 = require("typeorm");
const producer_entity_1 = require("./producer.entity");
const payment_report_item_entity_1 = require("./payment-report-item.entity");
let PaymentReport = class PaymentReport {
};
exports.PaymentReport = PaymentReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], PaymentReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], PaymentReport.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "producer_id" }),
    __metadata("design:type", String)
], PaymentReport.prototype, "producerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producer_entity_1.Producer),
    (0, typeorm_1.JoinColumn)({ name: "producer_id" }),
    __metadata("design:type", producer_entity_1.Producer)
], PaymentReport.prototype, "producer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], PaymentReport.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentReport.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "retention_amount", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PaymentReport.prototype, "retentionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "retention_notes", type: "text", nullable: true }),
    __metadata("design:type", String)
], PaymentReport.prototype, "retentionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_to_pay", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentReport.prototype, "totalToPay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pendiente", "pagado", "cancelado"],
        default: "pendiente",
    }),
    __metadata("design:type", String)
], PaymentReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_method", nullable: true }),
    __metadata("design:type", String)
], PaymentReport.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_reference", nullable: true }),
    __metadata("design:type", String)
], PaymentReport.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paid_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], PaymentReport.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], PaymentReport.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_report_item_entity_1.PaymentReportItem, (item) => item.paymentReport, { cascade: true }),
    __metadata("design:type", Array)
], PaymentReport.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], PaymentReport.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], PaymentReport.prototype, "updatedAt", void 0);
exports.PaymentReport = PaymentReport = __decorate([
    (0, typeorm_1.Entity)("payment_reports")
], PaymentReport);
//# sourceMappingURL=payment-report.entity.js.map