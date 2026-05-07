import { Controller, Post, Body } from '@nestjs/common';
import { RoutingService } from './routing.service';
import { VehicleType } from '../risk-engine/risk-engine.service';

class RouteRequestDto {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  vehicleType: VehicleType;
  waypoints?: Array<{ lat: number; lng: number }>;
}

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Post('calculate')
  async calculateRoute(@Body() request: RouteRequestDto) {
    return this.routingService.calculateOptimalRoute(
      request.origin,
      request.destination,
      request.vehicleType,
      request.waypoints
    );
  }
}
