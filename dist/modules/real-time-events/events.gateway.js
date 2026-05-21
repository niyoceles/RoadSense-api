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
exports.RealTimeEventGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const traffic_engine_service_1 = require("../risk-engine/traffic-engine.service");
let RealTimeEventGateway = class RealTimeEventGateway {
    constructor(trafficEngine) {
        this.trafficEngine = trafficEngine;
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    handleNearbySubscription(client, payload) {
        const lat = Number(payload?.lat);
        const lng = Number(payload?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng))
            return;
        client.join(this.areaRoom(lat, lng));
        client.join(`traffic:${this.areaRoom(lat, lng)}`);
        return { subscribed: true };
    }
    handleRouteSubscription(client, payload) {
        const routeId = String(payload?.routeId || '').slice(0, 80);
        if (!routeId)
            return;
        client.join(`route:${routeId}`);
        return { subscribed: true };
    }
    handleHazardReport(client, payload) {
        this.broadcastIncidentCreated({
            type: payload.type,
            location: payload.location,
            severity: payload.severity,
            timestamp: new Date(),
        });
    }
    async handleTrafficUpdate(client, payload) {
        const segment = await this.trafficEngine.recordTrafficUpdate({
            lat: payload.lat,
            lng: payload.lng,
            speedKmh: payload.speedKmh ?? payload.speed,
            heading: payload.heading,
            speedLimit: payload.speedLimit,
        });
        this.broadcastTrafficSegmentUpdate(segment);
    }
    broadcastIncidentCreated(report) {
        const room = this.reportRoom(report);
        this.server.to(room).emit('incident_created', report);
        this.server.to(room).emit('hazard_update', report);
    }
    broadcastIncidentUpdated(report) {
        this.server.to(this.reportRoom(report)).emit('incident_updated', report);
    }
    broadcastIncidentExpired(report) {
        this.server.to(this.reportRoom(report)).emit('incident_expired', report);
    }
    broadcastTrafficSegmentUpdate(segment) {
        if (!segment?.accepted && !segment?.segmentId)
            return;
        if (!Number.isFinite(Number(segment.centerLat)) || !Number.isFinite(Number(segment.centerLng))) {
            return;
        }
        const room = this.areaRoom(segment.centerLat, segment.centerLng);
        this.server.to(`traffic:${room}`).emit('traffic_segment_update', segment);
        this.server.to(`traffic:${room}`).emit('traffic_flow', {
            segmentId: segment.segmentId,
            avgSpeed: segment.avgSpeedKmh,
            trafficLevel: segment.trafficLevel,
        });
    }
    reportRoom(report) {
        const lat = report.latitude ?? report.location?.lat;
        const lng = report.longitude ?? report.location?.lng;
        return this.areaRoom(Number(lat), Number(lng));
    }
    areaRoom(lat, lng) {
        const tileLat = Math.floor(lat * 10) / 10;
        const tileLng = Math.floor(lng * 10) / 10;
        return `area:${tileLat.toFixed(1)}:${tileLng.toFixed(1)}`;
    }
};
exports.RealTimeEventGateway = RealTimeEventGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealTimeEventGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_nearby'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealTimeEventGateway.prototype, "handleNearbySubscription", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_route'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealTimeEventGateway.prototype, "handleRouteSubscription", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('report_hazard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealTimeEventGateway.prototype, "handleHazardReport", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('traffic_update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealTimeEventGateway.prototype, "handleTrafficUpdate", null);
exports.RealTimeEventGateway = RealTimeEventGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'events',
    }),
    __metadata("design:paramtypes", [traffic_engine_service_1.TrafficEngineService])
], RealTimeEventGateway);
//# sourceMappingURL=events.gateway.js.map