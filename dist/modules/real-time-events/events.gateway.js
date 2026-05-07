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
    handleHazardReport(client, payload) {
        this.server.emit('hazard_update', {
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
        this.server.emit('traffic_flow', {
            segmentId: segment.segmentId,
            avgSpeed: segment.avgSpeedKmh,
            trafficLevel: segment.trafficLevel,
        });
    }
};
exports.RealTimeEventGateway = RealTimeEventGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealTimeEventGateway.prototype, "server", void 0);
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