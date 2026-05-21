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

  @SubscribeMessage('subscribe_nearby')
  handleNearbySubscription(client: Socket, payload: any) {
    const lat = Number(payload?.lat);
    const lng = Number(payload?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    client.join(this.areaRoom(lat, lng));
    client.join(`traffic:${this.areaRoom(lat, lng)}`);
    return { subscribed: true };
  }

  @SubscribeMessage('subscribe_route')
  handleRouteSubscription(client: Socket, payload: any) {
    const routeId = String(payload?.routeId || '').slice(0, 80);
    if (!routeId) return;
    client.join(`route:${routeId}`);
    return { subscribed: true };
  }

  // Broadcast a hazard report to all nearby users
  @SubscribeMessage('report_hazard')
  handleHazardReport(client: Socket, payload: any) {
    // Logic to find users within radius using PostGIS would happen here
    this.broadcastIncidentCreated({
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

    this.broadcastTrafficSegmentUpdate(segment);
  }

  broadcastIncidentCreated(report: any) {
    const room = this.reportRoom(report);
    this.server.to(room).emit('incident_created', report);
    this.server.to(room).emit('hazard_update', report);
  }

  broadcastIncidentUpdated(report: any) {
    this.server.to(this.reportRoom(report)).emit('incident_updated', report);
  }

  broadcastIncidentExpired(report: any) {
    this.server.to(this.reportRoom(report)).emit('incident_expired', report);
  }

  broadcastTrafficSegmentUpdate(segment: any) {
    if (!segment?.accepted && !segment?.segmentId) return;
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

  private reportRoom(report: any): string {
    const lat = report.latitude ?? report.location?.lat;
    const lng = report.longitude ?? report.location?.lng;
    return this.areaRoom(Number(lat), Number(lng));
  }

  private areaRoom(lat: number, lng: number): string {
    const tileLat = Math.floor(lat * 10) / 10;
    const tileLng = Math.floor(lng * 10) / 10;
    return `area:${tileLat.toFixed(1)}:${tileLng.toFixed(1)}`;
  }
}
