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
exports.AssistantToolsService = void 0;
const common_1 = require("@nestjs/common");
const hazard_tool_1 = require("./hazard-tool");
const routing_tool_1 = require("./routing-tool");
const geocoding_tool_1 = require("./geocoding-tool");
const safety_tool_1 = require("./safety-tool");
let AssistantToolsService = class AssistantToolsService {
    constructor(hazardTool, routingTool, geocodingTool, safetyTool) {
        this.hazardTool = hazardTool;
        this.routingTool = routingTool;
        this.geocodingTool = geocodingTool;
        this.safetyTool = safetyTool;
    }
    findNearbyHazards(lat, lng, radiusMeters) {
        return this.hazardTool.findNearbyHazards(lat, lng, radiusMeters);
    }
    createHazardReportDraft(type, lat, lng, description) {
        return this.hazardTool.createHazardReportDraft(type, lat, lng, description);
    }
    confirmHazardReport(payload) {
        return this.hazardTool.confirmHazardReport(payload);
    }
    calculateRoute(origin, destination, vehicleType) {
        return this.routingTool.calculateRoute(origin, destination, vehicleType);
    }
    explainRouteChange(activeRouteId) {
        return this.routingTool.explainRouteChange(activeRouteId);
    }
    getSafetySummary(lat, lng, radiusMeters) {
        return this.safetyTool.getSafetySummary(lat, lng, radiusMeters);
    }
    geocodeDestination(query) {
        return this.geocodingTool.geocodeDestination(query);
    }
};
exports.AssistantToolsService = AssistantToolsService;
exports.AssistantToolsService = AssistantToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hazard_tool_1.HazardTool,
        routing_tool_1.RoutingTool,
        geocoding_tool_1.GeocodingTool,
        safety_tool_1.SafetyTool])
], AssistantToolsService);
//# sourceMappingURL=assistant-tools.service.js.map