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
exports.RoutingTool = void 0;
const common_1 = require("@nestjs/common");
const routing_service_1 = require("../../modules/routing/routing.service");
const risk_engine_service_1 = require("../../modules/risk-engine/risk-engine.service");
let RoutingTool = class RoutingTool {
    constructor(routingService) {
        this.routingService = routingService;
    }
    async calculateRoute(origin, destination, vehicleType) {
        return this.routingService.calculateOptimalRoute(origin, destination, this.toVehicleType(vehicleType));
    }
    explainRouteChange(activeRouteId) {
        if (!activeRouteId) {
            return {
                hasRouteContext: false,
                explanation: 'I need an active route to explain the change. Start navigation first, then ask again.',
            };
        }
        return {
            hasRouteContext: true,
            explanation: 'Your route may change when RoadSense detects traffic, hazards, closures, or a faster safer alternative.',
            activeRouteId,
        };
    }
    toVehicleType(value) {
        const normalized = value?.toUpperCase();
        if (normalized === 'MOTO')
            return risk_engine_service_1.VehicleType.MOTO;
        if (normalized === 'WALKING')
            return risk_engine_service_1.VehicleType.WALKING;
        if (normalized === 'CYCLING' || normalized === 'BICYCLE') {
            return risk_engine_service_1.VehicleType.CYCLING;
        }
        if (normalized === 'TRANSIT')
            return risk_engine_service_1.VehicleType.TRANSIT;
        return risk_engine_service_1.VehicleType.CAR;
    }
};
exports.RoutingTool = RoutingTool;
exports.RoutingTool = RoutingTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [routing_service_1.RoutingService])
], RoutingTool);
//# sourceMappingURL=routing-tool.js.map