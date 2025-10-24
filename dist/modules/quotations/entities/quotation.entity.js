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
exports.Quotation = void 0;
const typeorm_1 = require("typeorm");
const supplier_entity_1 = require("../../suppliers/entities/supplier.entity");
const quotation_item_entity_1 = require("./quotation-item.entity");
let Quotation = class Quotation {
};
exports.Quotation = Quotation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Quotation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Quotation.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "supplier_id" }),
    __metadata("design:type", String)
], Quotation.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier),
    (0, typeorm_1.JoinColumn)({ name: "supplier_id" }),
    __metadata("design:type", supplier_entity_1.Supplier)
], Quotation.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pendiente", "enviada", "respondida", "ganadora", "rechazada"],
        default: "pendiente",
    }),
    __metadata("design:type", String)
], Quotation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Quotation.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "valid_until", type: "date", nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Quotation.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "email_sent", default: false }),
    __metadata("design:type", Boolean)
], Quotation.prototype, "emailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "email_sent_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Quotation.prototype, "emailSentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "purchase_order_id", nullable: true }),
    __metadata("design:type", String)
], Quotation.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_item_entity_1.QuotationItem, (item) => item.quotation, { cascade: true }),
    __metadata("design:type", Array)
], Quotation.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Quotation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Quotation.prototype, "updatedAt", void 0);
exports.Quotation = Quotation = __decorate([
    (0, typeorm_1.Entity)("quotations")
], Quotation);
//# sourceMappingURL=quotation.entity.js.map