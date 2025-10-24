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
exports.ProducerAccountMovement = void 0;
const typeorm_1 = require("typeorm");
const producer_entity_1 = require("./producer.entity");
let ProducerAccountMovement = class ProducerAccountMovement {
};
exports.ProducerAccountMovement = ProducerAccountMovement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "producer_id" }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "producerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producer_entity_1.Producer),
    (0, typeorm_1.JoinColumn)({ name: "producer_id" }),
    __metadata("design:type", producer_entity_1.Producer)
], ProducerAccountMovement.prototype, "producer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["cargo", "abono", "pago"],
    }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProducerAccountMovement.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProducerAccountMovement.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reference_type", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reference_id", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reference_code", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "referenceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_method", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "payment_reference", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "evidence_url", nullable: true }),
    __metadata("design:type", String)
], ProducerAccountMovement.prototype, "evidenceUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], ProducerAccountMovement.prototype, "createdAt", void 0);
exports.ProducerAccountMovement = ProducerAccountMovement = __decorate([
    (0, typeorm_1.Entity)("producer_account_movements")
], ProducerAccountMovement);
//# sourceMappingURL=producer-account-movement.entity.js.map