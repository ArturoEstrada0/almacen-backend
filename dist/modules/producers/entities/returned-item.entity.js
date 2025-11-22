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
exports.ReturnedItem = void 0;
const typeorm_1 = require("typeorm");
const fruit_reception_entity_1 = require("./fruit-reception.entity");
const product_entity_1 = require("../../products/entities/product.entity");
let ReturnedItem = class ReturnedItem {
};
exports.ReturnedItem = ReturnedItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ReturnedItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reception_id" }),
    __metadata("design:type", String)
], ReturnedItem.prototype, "receptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fruit_reception_entity_1.FruitReception, (reception) => reception.returnedItems),
    (0, typeorm_1.JoinColumn)({ name: "reception_id" }),
    __metadata("design:type", fruit_reception_entity_1.FruitReception)
], ReturnedItem.prototype, "reception", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "product_id" }),
    __metadata("design:type", String)
], ReturnedItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", product_entity_1.Product)
], ReturnedItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ReturnedItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "unit_price", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ReturnedItem.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ReturnedItem.prototype, "total", void 0);
exports.ReturnedItem = ReturnedItem = __decorate([
    (0, typeorm_1.Entity)("returned_items")
], ReturnedItem);
//# sourceMappingURL=returned-item.entity.js.map