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
exports.RoadReportsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const create_report_dto_1 = require("./dto/create-report.dto");
const events_gateway_1 = require("../real-time-events/events.gateway");
let RoadReportsService = class RoadReportsService {
    constructor(gateway) {
        this.gateway = gateway;
        this.reports = [];
        this.storagePath = (0, path_1.join)(process.cwd(), 'data', 'reports.json');
        this.ready = this.loadReports();
    }
    async create(createReportDto) {
        await this.ready;
        const newReport = {
            id: Math.random().toString(36).substring(7),
            ...createReportDto,
            createdAt: new Date(),
            isVerified: false,
            verificationCount: 0,
            dismissalCount: 0,
        };
        this.enrichCameraReport(newReport);
        this.reports.push(newReport);
        await this.saveReports();
        this.gateway.server.emit('hazard_update', {
            type: newReport.type,
            location: { lat: newReport.latitude, lng: newReport.longitude },
            severity: newReport.severity,
            description: newReport.description,
            timestamp: newReport.createdAt,
        });
        return newReport;
    }
    async findAll() {
        await this.ready;
        return this.activeReports().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async findNearby(lat, lng, radius) {
        await this.ready;
        const radiusInDeg = radius / 111320;
        return this.activeReports().filter((report) => {
            const latDiff = Math.abs(report.latitude - lat);
            const lngDiff = Math.abs(report.longitude - lng);
            return latDiff < radiusInDeg && lngDiff < radiusInDeg;
        });
    }
    async findNearbyByTypes(lat, lng, radius, types) {
        const nearby = await this.findNearby(lat, lng, radius);
        return nearby.filter((report) => types.includes(report.type));
    }
    async verify(id) {
        await this.ready;
        const report = this.reports.find((item) => item.id === id);
        if (!report)
            return null;
        report.isVerified = true;
        report.verificationCount = (report.verificationCount || 0) + 1;
        if (report.type === create_report_dto_1.ReportType.SPEED_CAMERA) {
            report.cameraType = report.cameraType === 'red_light' ? 'red_light' : 'fixed';
            report.expiresAt = null;
            report.confidenceScore = this.cameraConfidence(report);
        }
        report.updatedAt = new Date();
        await this.saveReports();
        return report;
    }
    async dismiss(id) {
        await this.ready;
        const report = this.reports.find((item) => item.id === id);
        if (!report)
            return null;
        report.dismissalCount = (report.dismissalCount || 0) + 1;
        report.confidenceScore =
            report.type === create_report_dto_1.ReportType.SPEED_CAMERA
                ? this.cameraConfidence(report)
                : report.confidenceScore;
        report.updatedAt = new Date();
        await this.saveReports();
        return report;
    }
    async delete(id) {
        await this.ready;
        const before = this.reports.length;
        this.reports = this.reports.filter((item) => item.id !== id);
        if (this.reports.length !== before) {
            await this.saveReports();
        }
        return { deleted: this.reports.length !== before };
    }
    async loadReports() {
        try {
            const raw = await fs_1.promises.readFile(this.storagePath, 'utf8');
            this.reports = JSON.parse(raw);
        }
        catch (error) {
            this.reports = [];
            await this.saveReports();
        }
    }
    async saveReports() {
        await fs_1.promises.mkdir((0, path_1.join)(process.cwd(), 'data'), { recursive: true });
        await fs_1.promises.writeFile(this.storagePath, JSON.stringify(this.reports, null, 2), 'utf8');
    }
    activeReports() {
        const now = Date.now();
        return this.reports.filter((report) => {
            if (!report.expiresAt)
                return true;
            return new Date(report.expiresAt).getTime() > now;
        });
    }
    enrichCameraReport(report) {
        if (report.type !== create_report_dto_1.ReportType.SPEED_CAMERA)
            return;
        report.cameraType = report.cameraType || 'mobile';
        report.speedLimit =
            report.speedLimit || this.extractSpeedLimit(report.description) || 60;
        report.directionDegrees =
            typeof report.directionDegrees === 'number'
                ? this.normalizeDegrees(report.directionDegrees)
                : null;
        report.roadSegmentId =
            report.roadSegmentId ||
                this.segmentIdForLocation(report.latitude, report.longitude);
        report.confidenceScore = this.cameraConfidence(report);
        if (report.cameraType === 'mobile' && !report.expiresAt) {
            report.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        }
    }
    cameraConfidence(report) {
        const confirmations = report.verificationCount || 0;
        const dismissals = report.dismissalCount || 0;
        const verifiedBoost = report.isVerified ? 0.25 : 0;
        const score = 0.55 + verifiedBoost + confirmations * 0.08 - dismissals * 0.2;
        return Math.min(Math.max(score, 0.1), 0.98);
    }
    extractSpeedLimit(description) {
        const match = description?.match(/(\d{2,3})\s?(km\/h|kph|kmh)/i);
        if (!match)
            return null;
        return Number(match[1]);
    }
    normalizeDegrees(value) {
        return ((Math.round(value) % 360) + 360) % 360;
    }
    segmentIdForLocation(lat, lng) {
        const gridLat = Math.round(lat * 1000) / 1000;
        const gridLng = Math.round(lng * 1000) / 1000;
        return `${gridLat},${gridLng}`;
    }
};
exports.RoadReportsService = RoadReportsService;
exports.RoadReportsService = RoadReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_gateway_1.RealTimeEventGateway])
], RoadReportsService);
//# sourceMappingURL=road-reports.service.js.map