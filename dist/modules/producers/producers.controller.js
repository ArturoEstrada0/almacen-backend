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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProducersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const producers_service_1 = require("./producers.service");
const create_producer_dto_1 = require("./dto/create-producer.dto");
const create_input_assignment_dto_1 = require("./dto/create-input-assignment.dto");
const create_fruit_reception_dto_1 = require("./dto/create-fruit-reception.dto");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const create_payment_report_dto_1 = require("./dto/create-payment-report.dto");
const update_producer_dto_1 = require("./dto/update-producer.dto");
let ProducersController = class ProducersController {
    constructor(producersService) {
        this.producersService = producersService;
    }
    create(createProducerDto) {
        return this.producersService.create(createProducerDto);
    }
    findAll() {
        return this.producersService.findAll();
    }
    findOne(id) {
        return this.producersService.findOne(id);
    }
    createInputAssignment(dto) {
        return this.producersService.createInputAssignment(dto);
    }
    findAllInputAssignments() {
        return this.producersService.findAllInputAssignments();
    }
    updateInputAssignment(id, dto) {
        return this.producersService.updateInputAssignment(id, dto);
    }
    deleteInputAssignment(id) {
        return this.producersService.deleteInputAssignment(id);
    }
    createFruitReception(dto) {
        return this.producersService.createFruitReception(dto);
    }
    findAllFruitReceptions() {
        return this.producersService.findAllFruitReceptions();
    }
    updateFruitReception(id, dto) {
        return this.producersService.updateFruitReception(id, dto);
    }
    deleteFruitReception(id) {
        return this.producersService.deleteFruitReception(id);
    }
    createShipment(dto) {
        return this.producersService.createShipment(dto);
    }
    findAllShipments() {
        return this.producersService.findAllShipments();
    }
    updateShipmentStatus(id, status, salePrice) {
        return this.producersService.updateShipmentStatus(id, status, salePrice);
    }
    updateShipment(id, dto) {
        return this.producersService.updateShipment(id, dto);
    }
    deleteShipment(id) {
        return this.producersService.deleteShipment(id);
    }
    getAccountStatement(id) {
        return this.producersService.getAccountStatement(id);
    }
    createPayment(dto) {
        return this.producersService.createPayment(dto);
    }
    createPaymentReport(dto) {
        return this.producersService.createPaymentReport(dto);
    }
    findAllPaymentReports() {
        return this.producersService.findAllPaymentReports();
    }
    findOnePaymentReport(id) {
        return this.producersService.findOnePaymentReport(id);
    }
    updatePaymentReport(id, dto) {
        return this.producersService.updatePaymentReport(id, dto);
    }
    updatePaymentReportStatus(id, dto) {
        return this.producersService.updatePaymentReportStatus(id, dto);
    }
    deletePaymentReport(id) {
        return this.producersService.deletePaymentReport(id);
    }
    async updateProducer(id, updateProducerDto) {
        return this.producersService.updateProducer(id, updateProducerDto);
    }
};
exports.ProducersController = ProducersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new producer" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Producer created successfully" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_producer_dto_1.CreateProducerDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all producers" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of producers" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a producer by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Producer details' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)("input-assignments"),
    (0, swagger_1.ApiOperation)({ summary: "Create input assignment" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Input assignment created" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_input_assignment_dto_1.CreateInputAssignmentDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "createInputAssignment", null);
__decorate([
    (0, common_1.Get)("input-assignments/all"),
    (0, swagger_1.ApiOperation)({ summary: "Get all input assignments" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of input assignments" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findAllInputAssignments", null);
__decorate([
    (0, common_1.Patch)("input-assignments/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Update input assignment" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Input assignment updated" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_input_assignment_dto_1.CreateInputAssignmentDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "updateInputAssignment", null);
__decorate([
    (0, common_1.Delete)("input-assignments/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete input assignment" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Input assignment deleted" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "deleteInputAssignment", null);
__decorate([
    (0, common_1.Post)("fruit-receptions"),
    (0, swagger_1.ApiOperation)({ summary: "Create fruit reception" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Fruit reception created" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fruit_reception_dto_1.CreateFruitReceptionDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "createFruitReception", null);
__decorate([
    (0, common_1.Get)("fruit-receptions/all"),
    (0, swagger_1.ApiOperation)({ summary: "Get all fruit receptions" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of fruit receptions" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findAllFruitReceptions", null);
__decorate([
    (0, common_1.Patch)("fruit-receptions/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Update fruit reception" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Fruit reception updated" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_fruit_reception_dto_1.CreateFruitReceptionDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "updateFruitReception", null);
__decorate([
    (0, common_1.Delete)("fruit-receptions/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete fruit reception" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Fruit reception deleted" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "deleteFruitReception", null);
__decorate([
    (0, common_1.Post)("shipments"),
    (0, swagger_1.ApiOperation)({ summary: "Create shipment" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Shipment created" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shipment_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "createShipment", null);
__decorate([
    (0, common_1.Get)("shipments/all"),
    (0, swagger_1.ApiOperation)({ summary: "Get all shipments" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of shipments" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findAllShipments", null);
__decorate([
    (0, common_1.Patch)("shipments/:id/status"),
    (0, swagger_1.ApiOperation)({ summary: "Update shipment status" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Shipment status updated" }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('salePrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "updateShipmentStatus", null);
__decorate([
    (0, common_1.Patch)("shipments/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Update shipment" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Shipment updated" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "updateShipment", null);
__decorate([
    (0, common_1.Delete)("shipments/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete shipment" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Shipment deleted" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "deleteShipment", null);
__decorate([
    (0, common_1.Get)(':id/account-statement'),
    (0, swagger_1.ApiOperation)({ summary: 'Get producer account statement' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account statement' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "getAccountStatement", null);
__decorate([
    (0, common_1.Post)("payments"),
    (0, swagger_1.ApiOperation)({ summary: "Create payment" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Payment created" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)("payment-reports"),
    (0, swagger_1.ApiOperation)({ summary: "Create payment report" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Payment report created" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_report_dto_1.CreatePaymentReportDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "createPaymentReport", null);
__decorate([
    (0, common_1.Get)("payment-reports/all"),
    (0, swagger_1.ApiOperation)({ summary: "Get all payment reports" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of payment reports" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findAllPaymentReports", null);
__decorate([
    (0, common_1.Get)("payment-reports/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Get payment report by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Payment report details" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "findOnePaymentReport", null);
__decorate([
    (0, common_1.Patch)("payment-reports/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Update payment report" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Payment report updated" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_report_dto_1.CreatePaymentReportDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "updatePaymentReport", null);
__decorate([
    (0, common_1.Patch)("payment-reports/:id/status"),
    (0, swagger_1.ApiOperation)({ summary: "Update payment report status" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Payment report status updated" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_payment_report_dto_1.UpdatePaymentReportStatusDto]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "updatePaymentReportStatus", null);
__decorate([
    (0, common_1.Delete)("payment-reports/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete payment report" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Payment report deleted" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProducersController.prototype, "deletePaymentReport", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update a producer" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Producer updated successfully" }),
    __param(0, (0, common_1.Param)("id", common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_producer_dto_1.UpdateProducerDto]),
    __metadata("design:returntype", Promise)
], ProducersController.prototype, "updateProducer", null);
exports.ProducersController = ProducersController = __decorate([
    (0, swagger_1.ApiTags)("producers"),
    (0, common_1.Controller)("producers"),
    __metadata("design:paramtypes", [producers_service_1.ProducersService])
], ProducersController);
//# sourceMappingURL=producers.controller.js.map