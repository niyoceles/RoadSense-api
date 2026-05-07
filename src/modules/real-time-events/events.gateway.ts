import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'events',
})
export class RealTimeEventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
  handleTrafficUpdate(client: Socket, payload: any) {
    // Update road segment speed in Redis/DB
    this.server.emit('traffic_flow', {
      segmentId: payload.segmentId,
      avgSpeed: payload.speed,
    });
  }
}
