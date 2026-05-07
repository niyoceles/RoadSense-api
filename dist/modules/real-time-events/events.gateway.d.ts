import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';
export declare class RealTimeEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly trafficEngine;
    server: Server;
    constructor(trafficEngine: TrafficEngineService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleHazardReport(client: Socket, payload: any): void;
    handleTrafficUpdate(client: Socket, payload: any): Promise<void>;
}
