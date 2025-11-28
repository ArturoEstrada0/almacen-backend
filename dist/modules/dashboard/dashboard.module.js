"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dashboard_controller_1 = require("./dashboard.controller");
const dashboard_service_1 = require("./dashboard.service");
const product_entity_1 = require("../products/entities/product.entity");
const purchase_order_entity_1 = require("../purchase-orders/entities/purchase-order.entity");
const supplier_entity_1 = require("../suppliers/entities/supplier.entity");
const shipment_entity_1 = require("../producers/entities/shipment.entity");
const fruit_reception_entity_1 = require("../producers/entities/fruit-reception.entity");
const input_assignment_entity_1 = require("../producers/entities/input-assignment.entity");
const input_assignment_item_entity_1 = require("../producers/entities/input-assignment-item.entity");
let DashboardModule = class DashboardModule {
};
exports.DashboardModule = DashboardModule;
exports.DashboardModule = DashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                product_entity_1.Product,
                purchase_order_entity_1.PurchaseOrder,
                supplier_entity_1.Supplier,
                shipment_entity_1.Shipment,
                fruit_reception_entity_1.FruitReception,
                input_assignment_entity_1.InputAssignment,
                input_assignment_item_entity_1.InputAssignmentItem,
            ])
        ],
        controllers: [dashboard_controller_1.DashboardController],
        providers: [dashboard_service_1.DashboardService],
        exports: [dashboard_service_1.DashboardService],
    })
], DashboardModule);
//# sourceMappingURL=dashboard.module.js.map