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
exports.HazardTool = void 0;
const common_1 = require("@nestjs/common");
const create_report_dto_1 = require("../../modules/road-reports/dto/create-report.dto");
const road_reports_service_1 = require("../../modules/road-reports/road-reports.service");
let HazardTool = class HazardTool {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async findNearbyHazards(lat, lng, radiusMeters = 1500) {
        const safeRadius = Math.min(Math.max(radiusMeters, 50), 10000);
        try {
            return await this.reportsService.findNearby(lat, lng, safeRadius, 8);
        }
        catch (_) {
            return [];
        }
    }
    createHazardReportDraft(type, lat, lng, description) {
        return {
            hazardType: type,
            lat,
            lng,
            description: description || `Reported by RoadSense AI Co-Pilot`,
            confidence: 0.82,
        };
    }
    async confirmHazardReport(payload) {
        const report = {
            type: payload.hazardType,
            severity: this.defaultSeverity(payload.hazardType),
            latitude: payload.lat,
            longitude: payload.lng,
            description: payload.description || 'Reported by RoadSense AI Co-Pilot',
            source: 'user',
        };
        return this.reportsService.create(report);
    }
    defaultSeverity(type) {
        switch (type) {
            case create_report_dto_1.ReportType.ACCIDENT:
            case create_report_dto_1.ReportType.CRASH:
            case create_report_dto_1.ReportType.FLOOD:
            case create_report_dto_1.ReportType.CLOSURE:
                return create_report_dto_1.Severity.HIGH;
            case create_report_dto_1.ReportType.POTHOLE:
            case create_report_dto_1.ReportType.BAD_ROAD:
                return create_report_dto_1.Severity.MEDIUM;
            default:
                return create_report_dto_1.Severity.MEDIUM;
        }
    }
};
exports.HazardTool = HazardTool;
exports.HazardTool = HazardTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [road_reports_service_1.RoadReportsService])
], HazardTool);
//# sourceMappingURL=hazard-tool.js.map