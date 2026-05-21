import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrafficEngineService } from './traffic-engine.service';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';

class TrafficUpdateDto {
  lat: number;
  lng: number;
  speedKmh: number;
  heading?: number;
  speedLimit?: number;
  accuracyMeters?: number;
  vehicleType?: string;
  sessionId?: string;
}

@ApiTags('traffic')
@Controller('traffic')
export class TrafficController {
  constructor(
    private readonly trafficEngine: TrafficEngineService,
    private readonly events: RealTimeEventGateway,
  ) {}

  @Post(['update', 'samples'])
  @ApiOperation({ summary: 'Record an anonymous traffic speed sample' })
  async update(@Body() body: TrafficUpdateDto) {
    const segment = await this.trafficEngine.recordTrafficUpdate(body);
    if ((segment as any).accepted !== false) {
      this.events.broadcastTrafficSegmentUpdate(segment);
    }
    return segment;
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get live traffic segments near a coordinate' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  async nearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 5000,
  ) {
    return this.trafficEngine.findNearby(Number(lat), Number(lng), Number(radius));
  }

  @Post('route')
  @ApiOperation({ summary: 'Get traffic segments affecting a route polyline' })
  async route(@Body() body: { route: Array<{ lat: number; lng: number }>; corridorMeters?: number }) {
    return this.trafficEngine.findNearRoute(body.route || [], Number(body.corridorMeters));
  }
}
