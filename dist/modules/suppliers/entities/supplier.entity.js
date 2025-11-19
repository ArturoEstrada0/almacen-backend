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
exports.Supplier = void 0;
const typeorm_1 = require("typeorm");
const product_supplier_entity_1 = require("../../products/entities/product-supplier.entity");
const quotation_entity_1 = require("../../quotations/entities/quotation.entity");
let Supplier = class Supplier {
};
exports.Supplier = Supplier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Supplier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Supplier.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Supplier.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "rfc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "postal_code", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "contact_name", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "contactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "business_type", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "businessType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_terms", default: 0 }),
    __metadata("design:type", Number)
], Supplier.prototype, "paymentTerms", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Supplier.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "bank_name_mxn", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "bankNameMxn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "account_number_mxn", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "accountNumberMxn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "clabe_mxn", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "clabeMxn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "bank_name_usd", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "bankNameUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "account_number_usd", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "accountNumberUsd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "swift_code_usd", nullable: true }),
    __metadata("design:type", String)
], Supplier.prototype, "swiftCodeUsd", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_supplier_entity_1.ProductSupplier, (ps) => ps.supplier),
    __metadata("design:type", Array)
], Supplier.prototype, "productSuppliers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quotation_entity_1.Quotation, (quotation) => quotation.supplier),
    __metadata("design:type", Array)
], Supplier.prototype, "quotations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Supplier.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Supplier.prototype, "updatedAt", void 0);
exports.Supplier = Supplier = __decorate([
    (0, typeorm_1.Entity)("suppliers")
], Supplier);
//# sourceMappingURL=supplier.entity.js.map