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
exports.SafetyTool = void 0;
const common_1 = require("@nestjs/common");
const hazard_tool_1 = require("./hazard-tool");
let SafetyTool = class SafetyTool {
    constructor(hazardTool) {
        this.hazardTool = hazardTool;
    }
    async getSafetySummary(lat, lng, radiusMeters = 1500) {
        if (lat == null || lng == null) {
            return {
                hasLocation: false,
                summary: 'I can give better safety guidance when location is available. Keep attention on the road and use voice if you are driving.',
            };
        }
        const hazards = await this.hazardTool.findNearbyHazards(lat, lng, radiusMeters);
        return {
            hasLocation: true,
            hazardCount: hazards.length,
            summary: hazards.length === 0
                ? 'No active nearby hazards found. Stay alert and avoid typing while driving.'
                : `${hazards.length} active hazard${hazards.length === 1 ? '' : 's'} nearby. Slow down and follow road signs.`,
        };
    }
};
exports.SafetyTool = SafetyTool;
exports.SafetyTool = SafetyTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hazard_tool_1.HazardTool])
], SafetyTool);
//# sourceMappingURL=safety-tool.js.map