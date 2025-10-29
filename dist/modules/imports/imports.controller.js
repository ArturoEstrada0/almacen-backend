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
exports.ImportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const imports_service_1 = require("./imports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ImportsController = class ImportsController {
    constructor(importsService) {
        this.importsService = importsService;
    }
    async importFile(file, mapping, type, sheetName) {
        const parsedMapping = mapping ? JSON.parse(mapping) : {};
        return await this.importsService.importFile(file.buffer, parsedMapping, type, sheetName);
    }
};
exports.ImportsController = ImportsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Importar datos desde un archivo (XLSX/CSV)" }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", { storage: multer.memoryStorage() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mapping')),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Body)('sheetName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ImportsController.prototype, "importFile", null);
exports.ImportsController = ImportsController = __decorate([
    (0, swagger_1.ApiTags)("imports"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("imports"),
    __metadata("design:paramtypes", [imports_service_1.ImportsService])
], ImportsController);
//# sourceMappingURL=imports.controller.js.map