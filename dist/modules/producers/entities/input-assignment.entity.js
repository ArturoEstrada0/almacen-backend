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
exports.InputAssignment = void 0;
const typeorm_1 = require("typeorm");
const producer_entity_1 = require("./producer.entity");
const input_assignment_item_entity_1 = require("./input-assignment-item.entity");
let InputAssignment = class InputAssignment {
};
exports.InputAssignment = InputAssignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], InputAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], InputAssignment.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "producer_id" }),
    __metadata("design:type", String)
], InputAssignment.prototype, "producerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producer_entity_1.Producer),
    (0, typeorm_1.JoinColumn)({ name: "producer_id" }),
    __metadata("design:type", producer_entity_1.Producer)
], InputAssignment.prototype, "producer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], InputAssignment.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], InputAssignment.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], InputAssignment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => input_assignment_item_entity_1.InputAssignmentItem, (item) => item.assignment, { cascade: true }),
    __metadata("design:type", Array)
], InputAssignment.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], InputAssignment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], InputAssignment.prototype, "updatedAt", void 0);
exports.InputAssignment = InputAssignment = __decorate([
    (0, typeorm_1.Entity)("input_assignments")
], InputAssignment);
//# sourceMappingURL=input-assignment.entity.js.map