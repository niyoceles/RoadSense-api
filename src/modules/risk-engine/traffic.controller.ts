import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrafficEngineService } from './traffic-engine.service';

class TrafficUpdateDto {
  lat: number;
  lng: number;
  speedKmh: number;
  heading?: number;
  speedLimit?: number;
}

@ApiTags('traffic')
@Controller('traffic')
export class TrafficController {
  constructor(private readonly trafficEngine: TrafficEngineService) {}

  @Post('update')
  @ApiOperation({ summary: 'Record an anonymous traffic speed sample' })
  async update(@Body() body: TrafficUpdateDto) {
    return this.trafficEngine.recordTrafficUpdate(body);
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
    return this.trafficEngine.findNearby(lat, lng, radius);
  }
}
