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
exports.Producer = void 0;
const typeorm_1 = require("typeorm");
const input_assignment_entity_1 = require("./input-assignment.entity");
const fruit_reception_entity_1 = require("./fruit-reception.entity");
const producer_account_movement_entity_1 = require("./producer-account-movement.entity");
let Producer = class Producer {
};
exports.Producer = Producer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Producer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Producer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Producer.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Producer.prototype, "rfc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Producer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Producer.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Producer.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Producer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Producer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "account_balance", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Producer.prototype, "accountBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Producer.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => input_assignment_entity_1.InputAssignment, (assignment) => assignment.producer),
    __metadata("design:type", Array)
], Producer.prototype, "inputAssignments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => fruit_reception_entity_1.FruitReception, (reception) => reception.producer),
    __metadata("design:type", Array)
], Producer.prototype, "fruitReceptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => producer_account_movement_entity_1.ProducerAccountMovement, (movement) => movement.producer),
    __metadata("design:type", Array)
], Producer.prototype, "accountMovements", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Producer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Producer.prototype, "updatedAt", void 0);
exports.Producer = Producer = __decorate([
    (0, typeorm_1.Entity)("producers")
], Producer);
//# sourceMappingURL=producer.entity.js.map