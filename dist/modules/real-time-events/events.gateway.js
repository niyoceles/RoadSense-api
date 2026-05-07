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
let RealTimeEventGateway = class RealTimeEventGateway {
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
    handleTrafficUpdate(client, payload) {
        this.server.emit('traffic_flow', {
            segmentId: payload.segmentId,
            avgSpeed: payload.speed,
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
    __metadata("design:returntype", void 0)
], RealTimeEventGateway.prototype, "handleTrafficUpdate", null);
exports.RealTimeEventGateway = RealTimeEventGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: 'events',
    })
], RealTimeEventGateway);
//# sourceMappingURL=events.gateway.js.map