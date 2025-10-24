"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProducerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_producer_dto_1 = require("./create-producer.dto");
class UpdateProducerDto extends (0, swagger_1.PartialType)(create_producer_dto_1.CreateProducerDto) {
}
exports.UpdateProducerDto = UpdateProducerDto;
//# sourceMappingURL=update-producer.dto.js.map