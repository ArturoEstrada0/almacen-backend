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
exports.FruitReception = void 0;
const typeorm_1 = require("typeorm");
const producer_entity_1 = require("./producer.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const shipment_entity_1 = require("./shipment.entity");
const warehouse_entity_1 = require("../../warehouses/entities/warehouse.entity");
const returned_item_entity_1 = require("./returned-item.entity");
let FruitReception = class FruitReception {
};
exports.FruitReception = FruitReception;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], FruitReception.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], FruitReception.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "tracking_folio", nullable: true }),
    __metadata("design:type", String)
], FruitReception.prototype, "trackingFolio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "producer_id" }),
    __metadata("design:type", String)
], FruitReception.prototype, "producerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => producer_entity_1.Producer),
    (0, typeorm_1.JoinColumn)({ name: "producer_id" }),
    __metadata("design:type", producer_entity_1.Producer)
], FruitReception.prototype, "producer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "product_id" }),
    __metadata("design:type", String)
], FruitReception.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", product_entity_1.Product)
], FruitReception.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "warehouse_id" }),
    __metadata("design:type", String)
], FruitReception.prototype, "warehouseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse),
    (0, typeorm_1.JoinColumn)({ name: "warehouse_id" }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], FruitReception.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 10 }),
    __metadata("design:type", String)
], FruitReception.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], FruitReception.prototype, "boxes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "weight_per_box", type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], FruitReception.prototype, "weightPerBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "total_weight", type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], FruitReception.prototype, "totalWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "shipment_status",
        type: "enum",
        enum: ["pendiente", "embarcada", "vendida"],
        default: "pendiente",
    }),
    __metadata("design:type", String)
], FruitReception.prototype, "shipmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "payment_status",
        type: "enum",
        enum: ["pendiente", "pagada"],
        default: "pendiente",
        nullable: true,
    }),
    __metadata("design:type", String)
], FruitReception.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "shipment_id", nullable: true }),
    __metadata("design:type", String)
], FruitReception.prototype, "shipmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shipment_entity_1.Shipment, (shipment) => shipment.receptions, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "shipment_id" }),
    __metadata("design:type", shipment_entity_1.Shipment)
], FruitReception.prototype, "shipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "price_per_box", type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], FruitReception.prototype, "pricePerBox", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "final_total", type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], FruitReception.prototype, "finalTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "returned_boxes", type: "decimal", precision: 10, scale: 2, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], FruitReception.prototype, "returnedBoxes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "returned_boxes_value", type: "decimal", precision: 10, scale: 2, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], FruitReception.prototype, "returnedBoxesValue", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => returned_item_entity_1.ReturnedItem, (item) => item.reception, { cascade: true }),
    __metadata("design:type", Array)
], FruitReception.prototype, "returnedItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], FruitReception.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], FruitReception.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], FruitReception.prototype, "updatedAt", void 0);
exports.FruitReception = FruitReception = __decorate([
    (0, typeorm_1.Entity)("fruit_receptions")
], FruitReception);
//# sourceMappingURL=fruit-reception.entity.js.map