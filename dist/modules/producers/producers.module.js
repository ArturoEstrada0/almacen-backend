"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const producers_service_1 = require("./producers.service");
const producers_controller_1 = require("./producers.controller");
const producer_entity_1 = require("./entities/producer.entity");
const input_assignment_entity_1 = require("./entities/input-assignment.entity");
const input_assignment_item_entity_1 = require("./entities/input-assignment-item.entity");
const fruit_reception_entity_1 = require("./entities/fruit-reception.entity");
const shipment_entity_1 = require("./entities/shipment.entity");
const producer_account_movement_entity_1 = require("./entities/producer-account-movement.entity");
const inventory_module_1 = require("../inventory/inventory.module");
let ProducersModule = class ProducersModule {
};
exports.ProducersModule = ProducersModule;
exports.ProducersModule = ProducersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                producer_entity_1.Producer,
                input_assignment_entity_1.InputAssignment,
                input_assignment_item_entity_1.InputAssignmentItem,
                fruit_reception_entity_1.FruitReception,
                shipment_entity_1.Shipment,
                producer_account_movement_entity_1.ProducerAccountMovement,
            ]),
            inventory_module_1.InventoryModule,
        ],
        controllers: [producers_controller_1.ProducersController],
        providers: [producers_service_1.ProducersService],
        exports: [producers_service_1.ProducersService],
    })
], ProducersModule);
//# sourceMappingURL=producers.module.js.map