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
exports.InventoryItem = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const warehouse_entity_1 = require("../../warehouses/entities/warehouse.entity");
let InventoryItem = class InventoryItem {
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], InventoryItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "product_id" }),
    __metadata("design:type", String)
], InventoryItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", product_entity_1.Product)
], InventoryItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "warehouse_id" }),
    __metadata("design:type", String)
], InventoryItem.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse),
    (0, typeorm_1.JoinColumn)({ name: "warehouse_id" }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], InventoryItem.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "min_stock", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "minStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "max_stock", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "maxStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reorder_point", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "location_code", nullable: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], InventoryItem.prototype, "updatedAt", void 0);
exports.InventoryItem = InventoryItem = __decorate([
    (0, typeorm_1.Entity)("inventory"),
    (0, typeorm_1.Index)(["productId", "warehouseId"], { unique: true })
], InventoryItem);
//# sourceMappingURL=inventory-item.entity.js.map