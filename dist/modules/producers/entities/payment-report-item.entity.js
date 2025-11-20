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
exports.PaymentReportItem = void 0;
const typeorm_1 = require("typeorm");
const payment_report_entity_1 = require("./payment-report.entity");
const fruit_reception_entity_1 = require("./fruit-reception.entity");
let PaymentReportItem = class PaymentReportItem {
};
exports.PaymentReportItem = PaymentReportItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], PaymentReportItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_report_id" }),
    __metadata("design:type", String)
], PaymentReportItem.prototype, "paymentReportId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_report_entity_1.PaymentReport, (report) => report.items, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "payment_report_id" }),
    __metadata("design:type", payment_report_entity_1.PaymentReport)
], PaymentReportItem.prototype, "paymentReport", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "fruit_reception_id" }),
    __metadata("design:type", String)
], PaymentReportItem.prototype, "fruitReceptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fruit_reception_entity_1.FruitReception),
    (0, typeorm_1.JoinColumn)({ name: "fruit_reception_id" }),
    __metadata("design:type", fruit_reception_entity_1.FruitReception)
], PaymentReportItem.prototype, "fruitReception", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentReportItem.prototype, "boxes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_per_box", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentReportItem.prototype, "pricePerBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentReportItem.prototype, "subtotal", void 0);
exports.PaymentReportItem = PaymentReportItem = __decorate([
    (0, typeorm_1.Entity)("payment_report_items")
], PaymentReportItem);
//# sourceMappingURL=payment-report-item.entity.js.map