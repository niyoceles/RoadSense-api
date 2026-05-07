import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'events',
})
export class RealTimeEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly trafficEngine: TrafficEngineService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Broadcast a hazard report to all nearby users
  @SubscribeMessage('report_hazard')
  handleHazardReport(client: Socket, payload: any) {
    // Logic to find users within radius using PostGIS would happen here
    this.server.emit('hazard_update', {
      type: payload.type,
      location: payload.location,
      severity: payload.severity,
      timestamp: new Date(),
    });
  }

  // Real-time traffic speed updates from users
  @SubscribeMessage('traffic_update')
  async handleTrafficUpdate(client: Socket, payload: any) {
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
}
