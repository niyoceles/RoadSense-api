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
exports.TrafficController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const traffic_engine_service_1 = require("./traffic-engine.service");
class TrafficUpdateDto {
}
let TrafficController = class TrafficController {
    constructor(trafficEngine) {
        this.trafficEngine = trafficEngine;
    }
    async update(body) {
        return this.trafficEngine.recordTrafficUpdate(body);
    }
    async nearby(lat, lng, radius = 5000) {
        return this.trafficEngine.findNearby(lat, lng, radius);
    }
};
exports.TrafficController = TrafficController;
__decorate([
    (0, common_1.Post)('update'),
    (0, swagger_1.ApiOperation)({ summary: 'Record an anonymous traffic speed sample' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TrafficUpdateDto]),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Get live traffic segments near a coordinate' }),
    (0, swagger_1.ApiQuery)({ name: 'lat', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lng', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'radius', type: Number, required: false }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], TrafficController.prototype, "nearby", null);
exports.TrafficController = TrafficController = __decorate([
    (0, swagger_1.ApiTags)('traffic'),
    (0, common_1.Controller)('traffic'),
    __metadata("design:paramtypes", [traffic_engine_service_1.TrafficEngineService])
], TrafficController);
//# sourceMappingURL=traffic.controller.js.map