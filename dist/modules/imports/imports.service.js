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
exports.ImportsService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = require("xlsx");
const products_service_1 = require("../products/products.service");
const warehouses_service_1 = require("../warehouses/warehouses.service");
let ImportsService = class ImportsService {
    constructor(productsService, warehousesService) {
        this.productsService = productsService;
        this.warehousesService = warehousesService;
    }
    async importFile(buffer, mapping, type, sheetName) {
        if (!buffer)
            throw new common_1.BadRequestException('No file provided');
        if (!type)
            throw new common_1.BadRequestException('No import type provided');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
        if (!sheet)
            throw new common_1.BadRequestException('Sheet not found');
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (!rows || rows.length < 2) {
            return { processed: 0, success: 0, errors: ['No rows found in sheet'] };
        }
        const headers = rows[0].map((h) => (h ?? '').toString().trim());
        const dataRows = rows.slice(1);
        const result = { processed: dataRows.length, success: 0, errors: [] };
        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const rowNumber = i + 2;
            try {
                if (type === 'products') {
                    const dto = {};
                    const skuCol = mapping['sku'];
                    const nameCol = mapping['name'];
                    if (!skuCol || !nameCol)
                        throw new Error('SKU or Name mapping missing');
                    const sku = row[headers.indexOf(skuCol)] ?? '';
                    const name = row[headers.indexOf(nameCol)] ?? '';
                    if (!sku || !name)
                        throw new Error('SKU or Name empty');
                    dto.sku = String(sku).trim();
                    dto.name = String(name).trim();
                    if (mapping['description'])
                        dto.description = String(row[headers.indexOf(mapping['description'])] ?? '').trim();
                    await this.productsService.create(dto);
                    result.success++;
                }
                else if (type === 'warehouses' || type === 'warehouses') {
                    const codeCol = mapping['code'];
                    const nameCol = mapping['name'];
                    if (!codeCol || !nameCol)
                        throw new Error('Code or Name mapping missing');
                    const code = row[headers.indexOf(codeCol)] ?? '';
                    const name = row[headers.indexOf(nameCol)] ?? '';
                    if (!code || !name)
                        throw new Error('Code or Name empty');
                    const dto = {
                        code: String(code).trim(),
                        name: String(name).trim(),
                    };
                    if (mapping['address'])
                        dto.address = String(row[headers.indexOf(mapping['address'])] ?? '').trim();
                    await this.warehousesService.create(dto);
                    result.success++;
                }
                else {
                    throw new Error('Unsupported import type');
                }
            }
            catch (err) {
                result.errors.push({ row: rowNumber, error: err.message || String(err) });
            }
        }
        return result;
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        warehouses_service_1.WarehousesService])
], ImportsService);
//# sourceMappingURL=imports.service.js.map