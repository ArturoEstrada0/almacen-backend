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
exports.Movement = void 0;
const typeorm_1 = require("typeorm");
const warehouse_entity_1 = require("../../warehouses/entities/warehouse.entity");
const movement_item_entity_1 = require("./movement-item.entity");
let Movement = class Movement {
};
exports.Movement = Movement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Movement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Movement.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["entrada", "salida", "ajuste", "traspaso"],
    }),
    __metadata("design:type", String)
], Movement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "warehouse_id" }),
    __metadata("design:type", String)
], Movement.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse),
    (0, typeorm_1.JoinColumn)({ name: "warehouse_id" }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], Movement.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "destination_warehouse_id", nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "destinationWarehouseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse),
    (0, typeorm_1.JoinColumn)({ name: "destination_warehouse_id" }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], Movement.prototype, "destinationWarehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reference_type", nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "reference_id", nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "created_by", nullable: true }),
    __metadata("design:type", String)
], Movement.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => movement_item_entity_1.MovementItem, (item) => item.movement, { cascade: true }),
    __metadata("design:type", Array)
], Movement.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Movement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Movement.prototype, "updatedAt", void 0);
exports.Movement = Movement = __decorate([
    (0, typeorm_1.Entity)("movements")
], Movement);
//# sourceMappingURL=movement.entity.js.map