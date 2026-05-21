import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';
export declare class RealTimeEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly trafficEngine;
    server: Server;
    constructor(trafficEngine: TrafficEngineService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleNearbySubscription(client: Socket, payload: any): {
        subscribed: boolean;
    };
    handleRouteSubscription(client: Socket, payload: any): {
        subscribed: boolean;
    };
    handleHazardReport(client: Socket, payload: any): void;
    handleTrafficUpdate(client: Socket, payload: any): Promise<void>;
    broadcastIncidentCreated(report: any): void;
    broadcastIncidentUpdated(report: any): void;
    broadcastIncidentExpired(report: any): void;
    broadcastTrafficSegmentUpdate(segment: any): void;
    private reportRoom;
    private areaRoom;
}
