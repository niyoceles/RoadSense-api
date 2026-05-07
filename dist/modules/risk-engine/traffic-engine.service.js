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
exports.TrafficEngineService = exports.TrafficLevel = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
var TrafficLevel;
(function (TrafficLevel) {
    TrafficLevel["FLUID"] = "fluid";
    TrafficLevel["MODERATE"] = "moderate";
    TrafficLevel["CONGESTED"] = "congested";
    TrafficLevel["BLOCKED"] = "blocked";
})(TrafficLevel || (exports.TrafficLevel = TrafficLevel = {}));
let TrafficEngineService = class TrafficEngineService {
    constructor() {
        this.storagePath = (0, path_1.join)(process.cwd(), 'data', 'traffic.json');
        this.segments = new Map();
        this.ready = this.loadSegments();
    }
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
        const segment = this.segments.get(segmentId);
        const trafficMultiplier = this.multiplierForLevel(segment?.trafficLevel);
        return baseWeight * trafficMultiplier;
    }
    async recordTrafficUpdate(update) {
        await this.ready;
        const segmentId = this.segmentIdForLocation(update.lat, update.lng);
        const existing = this.segments.get(segmentId);
        const sampleCount = existing?.sampleCount || 0;
        const avgSpeedKmh = existing
            ? (existing.avgSpeedKmh * sampleCount + update.speedKmh) /
                (sampleCount + 1)
            : update.speedKmh;
        const speedLimit = update.speedLimit || existing?.speedLimit || 60;
        const trafficLevel = this.calculateTrafficLevel(avgSpeedKmh, speedLimit);
        const segment = {
            segmentId,
            centerLat: this.roundToGrid(update.lat),
            centerLng: this.roundToGrid(update.lng),
            avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
            speedLimit,
            trafficLevel,
            sampleCount: sampleCount + 1,
            lastHeading: update.heading,
            updatedAt: new Date(),
        };
        this.segments.set(segmentId, segment);
        await this.saveSegments();
        return segment;
    }
    async findNearby(lat, lng, radiusMeters = 5000) {
        await this.ready;
        return [...this.segments.values()]
            .filter((segment) => {
            const distance = this.distanceMeters(lat, lng, segment.centerLat, segment.centerLng);
            return distance <= radiusMeters;
        })
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    getTrafficLevelAt(lat, lng) {
        const segmentId = this.segmentIdForLocation(lat, lng);
        const segment = this.segments.get(segmentId);
        return segment?.trafficLevel || TrafficLevel.FLUID;
    }
    segmentIdForLocation(lat, lng) {
        return `${this.roundToGrid(lat)},${this.roundToGrid(lng)}`;
    }
    roundToGrid(value) {
        return Math.round(value * 500) / 500;
    }
    multiplierForLevel(level) {
        switch (level) {
            case TrafficLevel.MODERATE:
                return 1.2;
            case TrafficLevel.CONGESTED:
                return 1.6;
            case TrafficLevel.BLOCKED:
                return 3.0;
            case TrafficLevel.FLUID:
            default:
                return 1.0;
        }
    }
    async loadSegments() {
        try {
            const raw = await fs_1.promises.readFile(this.storagePath, 'utf8');
            const saved = JSON.parse(raw);
            this.segments = new Map(saved.map((segment) => [segment.segmentId, segment]));
        }
        catch (error) {
            this.segments = new Map();
            await this.saveSegments();
        }
    }
    async saveSegments() {
        await fs_1.promises.mkdir((0, path_1.join)(process.cwd(), 'data'), { recursive: true });
        await fs_1.promises.writeFile(this.storagePath, JSON.stringify([...this.segments.values()], null, 2), 'utf8');
    }
    distanceMeters(lat1, lng1, lat2, lng2) {
        const earthRadiusM = 6371000;
        const toRad = (degrees) => (degrees * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        return 2 * earthRadiusM * Math.asin(Math.sqrt(a));
    }
};
exports.TrafficEngineService = TrafficEngineService;
exports.TrafficEngineService = TrafficEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TrafficEngineService);
//# sourceMappingURL=traffic-engine.service.js.map