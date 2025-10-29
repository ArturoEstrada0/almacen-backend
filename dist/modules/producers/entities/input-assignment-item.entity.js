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
exports.InputAssignmentItem = void 0;
const typeorm_1 = require("typeorm");
const input_assignment_entity_1 = require("./input-assignment.entity");
const product_entity_1 = require("../../products/entities/product.entity");
let InputAssignmentItem = class InputAssignmentItem {
};
exports.InputAssignmentItem = InputAssignmentItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], InputAssignmentItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "assignment_id" }),
    __metadata("design:type", String)
], InputAssignmentItem.prototype, "assignmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => input_assignment_entity_1.InputAssignment, (assignment) => assignment.items),
    (0, typeorm_1.JoinColumn)({ name: "assignment_id" }),
    __metadata("design:type", input_assignment_entity_1.InputAssignment)
], InputAssignmentItem.prototype, "assignment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "product_id" }),
    __metadata("design:type", String)
], InputAssignmentItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", product_entity_1.Product)
], InputAssignmentItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InputAssignmentItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "unit_price", type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InputAssignmentItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], InputAssignmentItem.prototype, "total", void 0);
exports.InputAssignmentItem = InputAssignmentItem = __decorate([
    (0, typeorm_1.Entity)("input_assignment_items")
], InputAssignmentItem);
//# sourceMappingURL=input-assignment-item.entity.js.map