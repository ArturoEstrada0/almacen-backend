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
exports.ProductSupplier = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const supplier_entity_1 = require("../../suppliers/entities/supplier.entity");
let ProductSupplier = class ProductSupplier {
};
exports.ProductSupplier = ProductSupplier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProductSupplier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "product_id" }),
    __metadata("design:type", String)
], ProductSupplier.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.productSuppliers),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", product_entity_1.Product)
], ProductSupplier.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "supplier_id" }),
    __metadata("design:type", String)
], ProductSupplier.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier, (supplier) => supplier.productSuppliers),
    (0, typeorm_1.JoinColumn)({ name: "supplier_id" }),
    __metadata("design:type", supplier_entity_1.Supplier)
], ProductSupplier.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProductSupplier.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "supplier_sku", nullable: true }),
    __metadata("design:type", String)
], ProductSupplier.prototype, "supplierSku", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "lead_time_days", default: 0 }),
    __metadata("design:type", Number)
], ProductSupplier.prototype, "leadTimeDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "minimum_order", type: "decimal", precision: 10, scale: 2, default: 1 }),
    __metadata("design:type", Number)
], ProductSupplier.prototype, "minimumOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProductSupplier.prototype, "preferred", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProductSupplier.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], ProductSupplier.prototype, "updatedAt", void 0);
exports.ProductSupplier = ProductSupplier = __decorate([
    (0, typeorm_1.Entity)("product_suppliers")
], ProductSupplier);
//# sourceMappingURL=product-supplier.entity.js.map