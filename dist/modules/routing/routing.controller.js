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
exports.RoutingController = void 0;
const common_1 = require("@nestjs/common");
const routing_service_1 = require("./routing.service");
class RouteRequestDto {
}
let RoutingController = class RoutingController {
    constructor(routingService) {
        this.routingService = routingService;
    }
    async calculateRoute(request) {
        return this.routingService.calculateOptimalRoute(request.origin, request.destination, request.vehicleType, request.waypoints);
    }
    async getSpeedLimit(location) {
        const limit = await this.routingService.getSpeedLimit(location.lat, location.lng);
        return { speedLimit: limit };
    }
};
exports.RoutingController = RoutingController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RouteRequestDto]),
    __metadata("design:returntype", Promise)
], RoutingController.prototype, "calculateRoute", null);
__decorate([
    (0, common_1.Post)('speed-limit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoutingController.prototype, "getSpeedLimit", null);
exports.RoutingController = RoutingController = __decorate([
    (0, common_1.Controller)('routing'),
    __metadata("design:paramtypes", [routing_service_1.RoutingService])
], RoutingController);
//# sourceMappingURL=routing.controller.js.map