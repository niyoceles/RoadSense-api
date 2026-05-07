"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskEngineService = exports.ReportSeverity = exports.VehicleType = void 0;
const common_1 = require("@nestjs/common");
var VehicleType;
(function (VehicleType) {
    VehicleType["CAR"] = "CAR";
    VehicleType["WALKING"] = "WALKING";
    VehicleType["TRANSIT"] = "TRANSIT";
    VehicleType["CYCLING"] = "CYCLING";
    VehicleType["MOTO"] = "MOTO";
})(VehicleType || (exports.VehicleType = VehicleType = {}));
var ReportSeverity;
(function (ReportSeverity) {
    ReportSeverity[ReportSeverity["LOW"] = 1] = "LOW";
    ReportSeverity[ReportSeverity["MEDIUM"] = 2] = "MEDIUM";
    ReportSeverity[ReportSeverity["HIGH"] = 3] = "HIGH";
    ReportSeverity[ReportSeverity["CRITICAL"] = 4] = "CRITICAL";
})(ReportSeverity || (exports.ReportSeverity = ReportSeverity = {}));
let RiskEngineService = class RiskEngineService {
    calculateRisk(potholeDensity, maxSeverity, vehicleType) {
        const severityRisk = maxSeverity / 4.0;
        let baseRisk = (severityRisk * 0.6) + (potholeDensity * 0.4);
        const modifiers = {
            [VehicleType.CAR]: 1.0,
            [VehicleType.WALKING]: 0.5,
            [VehicleType.TRANSIT]: 0.8,
            [VehicleType.CYCLING]: 1.2,
            [VehicleType.MOTO]: 1.5,
        };
        const riskScore = baseRisk * (modifiers[vehicleType] || 1.0);
        return Math.min(Math.max(riskScore, 0), 1);
    }
    getRiskLevel(score) {
        if (score < 0.3)
            return 'safe';
        if (score < 0.7)
            return 'caution';
        return 'danger';
    }
};
exports.RiskEngineService = RiskEngineService;
exports.RiskEngineService = RiskEngineService = __decorate([
    (0, common_1.Injectable)()
], RiskEngineService);
//# sourceMappingURL=risk-engine.service.js.map