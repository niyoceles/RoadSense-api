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
exports.RoutingService = void 0;
const common_1 = require("@nestjs/common");
const risk_engine_service_1 = require("../risk-engine/risk-engine.service");
const traffic_engine_service_1 = require("../risk-engine/traffic-engine.service");
let RoutingService = class RoutingService {
    constructor(riskEngine, trafficEngine) {
        this.riskEngine = riskEngine;
        this.trafficEngine = trafficEngine;
    }
    async calculateOptimalRoute(origin, destination, vehicleType, waypoints) {
        const candidateRoutes = this.fetchCandidateRoutes(origin, destination, waypoints);
        const scoredRoutes = candidateRoutes.map(route => {
            let totalCost = 0;
            let totalTime = route.baseTimeSeconds;
            let maxRiskEncountered = 0;
            for (const segment of route.segments) {
                const currentSpeed = this.getRealTimeSpeed(segment.id);
                const trafficMultiplier = this.trafficEngine.getDynamicRouteWeight(segment.id, 1.0);
                const segmentTime = segment.baseTime * trafficMultiplier;
                totalTime += segmentTime - segment.baseTime;
                const potholeDensity = Math.random();
                const maxSeverity = risk_engine_service_1.ReportSeverity.MEDIUM;
                const riskScore = this.riskEngine.calculateRisk(potholeDensity, maxSeverity, vehicleType);
                if (riskScore > maxRiskEncountered)
                    maxRiskEncountered = riskScore;
                const riskPenalty = 1.0 + (riskScore * 2);
                totalCost += segmentTime * riskPenalty;
            }
            return {
                ...route,
                estimatedTimeSeconds: totalTime,
                safetyRiskScore: maxRiskEncountered,
                totalCost,
                riskLevel: this.riskEngine.getRiskLevel(maxRiskEncountered)
            };
        });
        scoredRoutes.sort((a, b) => a.totalCost - b.totalCost);
        return {
            primaryRoute: scoredRoutes[0],
            alternatives: scoredRoutes.slice(1, 3)
        };
    }
    fetchCandidateRoutes(origin, dest, waypoints) {
        return [
            {
                id: 'route_1_fastest',
                distanceMeters: 5000,
                baseTimeSeconds: 600,
                segments: [{ id: 'seg_a', baseTime: 300 }, { id: 'seg_b', baseTime: 300 }]
            },
            {
                id: 'route_2_safest',
                distanceMeters: 5500,
                baseTimeSeconds: 660,
                segments: [{ id: 'seg_c', baseTime: 330 }, { id: 'seg_d', baseTime: 330 }]
            }
        ];
    }
    getRealTimeSpeed(segmentId) {
        return 45;
    }
};
exports.RoutingService = RoutingService;
exports.RoutingService = RoutingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [risk_engine_service_1.RiskEngineService,
        traffic_engine_service_1.TrafficEngineService])
], RoutingService);
//# sourceMappingURL=routing.service.js.map