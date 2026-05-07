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
exports.CamerasService = exports.CameraType = void 0;
const common_1 = require("@nestjs/common");
const create_report_dto_1 = require("../road-reports/dto/create-report.dto");
const road_reports_service_1 = require("../road-reports/road-reports.service");
var CameraType;
(function (CameraType) {
    CameraType["FIXED"] = "fixed";
    CameraType["MOBILE"] = "mobile";
    CameraType["RED_LIGHT"] = "red_light";
})(CameraType || (exports.CameraType = CameraType = {}));
let CamerasService = class CamerasService {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getNearbyCameras(lat, lng, radius) {
        const reports = await this.reportsService.findNearbyByTypes(lat, lng, radius, [create_report_dto_1.ReportType.SPEED_CAMERA]);
        return reports.map((report) => ({
            id: report.id,
            lat: report.latitude,
            lng: report.longitude,
            type: this.cameraTypeFromReport(report),
            speedLimit: report.speedLimit || this.extractSpeedLimit(report.description),
            reportedBy: report.reportedBy,
            confidenceScore: report.confidenceScore ?? this.calculateConfidence(report),
            directionDegrees: report.directionDegrees,
            roadSegmentId: report.roadSegmentId,
            expiresAt: report.expiresAt,
            isVerified: report.isVerified,
            description: report.description,
        }));
    }
    async getCamerasAlongRoute(routeLineString) {
        return [];
    }
    checkApproachingCamera(currentSpeed, camera) {
        if (currentSpeed > camera.speedLimit * 1.1) {
            return `Warning! Speed camera ahead. Limit is ${camera.speedLimit} km/h. Slow down!`;
        }
        return `Speed camera reported ahead. Limit is ${camera.speedLimit} km/h.`;
    }
    calculateConfidence(report) {
        const confirmations = report.verificationCount || 0;
        const dismissals = report.dismissalCount || 0;
        const score = 0.55 + confirmations * 0.1 - dismissals * 0.2;
        return Math.min(Math.max(score, 0.1), 0.95);
    }
    cameraTypeFromReport(report) {
        if (report.cameraType === CameraType.FIXED)
            return CameraType.FIXED;
        if (report.cameraType === CameraType.RED_LIGHT)
            return CameraType.RED_LIGHT;
        return CameraType.MOBILE;
    }
    extractSpeedLimit(description) {
        const match = description?.match(/(\d{2,3})\s?(km\/h|kph|kmh)/i);
        if (!match)
            return 60;
        return Number(match[1]);
    }
};
exports.CamerasService = CamerasService;
exports.CamerasService = CamerasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [road_reports_service_1.RoadReportsService])
], CamerasService);
//# sourceMappingURL=cameras.service.js.map