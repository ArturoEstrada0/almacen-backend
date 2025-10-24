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
exports.Shipment = void 0;
const typeorm_1 = require("typeorm");
const fruit_reception_entity_1 = require("./fruit-reception.entity");
let Shipment = class Shipment {
};
exports.Shipment = Shipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Shipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Shipment.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Shipment.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["embarcada", "recibida", "vendida"],
        default: "embarcada",
    }),
    __metadata("design:type", String)
], Shipment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_boxes", type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Shipment.prototype, "totalBoxes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "carrier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "shipped_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "shippedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "received_at", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "receivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "sale_price_per_box", type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "salePricePerBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_sale", type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "totalSale", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => fruit_reception_entity_1.FruitReception, (reception) => reception.shipmentId),
    __metadata("design:type", Array)
], Shipment.prototype, "receptions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Shipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Shipment.prototype, "updatedAt", void 0);
exports.Shipment = Shipment = __decorate([
    (0, typeorm_1.Entity)("shipments")
], Shipment);
//# sourceMappingURL=shipment.entity.js.map