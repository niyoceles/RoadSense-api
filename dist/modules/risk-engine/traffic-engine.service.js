"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrafficEngineService = exports.TrafficLevel = void 0;
const common_1 = require("@nestjs/common");
var TrafficLevel;
(function (TrafficLevel) {
    TrafficLevel["FLUID"] = "fluid";
    TrafficLevel["MODERATE"] = "moderate";
    TrafficLevel["CONGESTED"] = "congested";
    TrafficLevel["BLOCKED"] = "blocked";
})(TrafficLevel || (exports.TrafficLevel = TrafficLevel = {}));
let TrafficEngineService = class TrafficEngineService {
    calculateTrafficLevel(currentSpeed, speedLimit) {
        const ratio = currentSpeed / speedLimit;
        if (ratio >= 0.8)
            return TrafficLevel.FLUID;
        if (ratio >= 0.5)
            return TrafficLevel.MODERATE;
        if (ratio >= 0.2)
            return TrafficLevel.CONGESTED;
        return TrafficLevel.BLOCKED;
    }
    getDynamicRouteWeight(segmentId, baseWeight) {
        const trafficMultiplier = 1.2;
        return baseWeight * trafficMultiplier;
    }
};
exports.TrafficEngineService = TrafficEngineService;
exports.TrafficEngineService = TrafficEngineService = __decorate([
    (0, common_1.Injectable)()
], TrafficEngineService);
//# sourceMappingURL=traffic-engine.service.js.map