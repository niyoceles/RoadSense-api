import { Injectable } from '@nestjs/common';
import { RoutingService } from '../../modules/routing/routing.service';
import { VehicleType } from '../../modules/risk-engine/risk-engine.service';

@Injectable()
export class RoutingTool {
  constructor(private readonly routingService: RoutingService) {}

  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    vehicleType?: string,
  ) {
    return this.routingService.calculateOptimalRoute(
      origin,
      destination,
      this.toVehicleType(vehicleType),
    );
  }

  explainRouteChange(activeRouteId?: string) {
    if (!activeRouteId) {
      return {
        hasRouteContext: false,
        explanation:
          'I need an active route to explain the change. Start navigation first, then ask again.',
      };
    }

    // TODO: Connect this to persisted navigation session/reroute events when available.
    return {
      hasRouteContext: true,
      explanation:
        'Your route may change when RoadSense detects traffic, hazards, closures, or a faster safer alternative.',
      activeRouteId,
    };
  }

  private toVehicleType(value?: string): VehicleType {
    const normalized = value?.toUpperCase();
    if (normalized === 'MOTO') return VehicleType.MOTO;
    if (normalized === 'WALKING') return VehicleType.WALKING;
    if (normalized === 'CYCLING' || normalized === 'BICYCLE') {
      return VehicleType.CYCLING;
    }
    if (normalized === 'TRANSIT') return VehicleType.TRANSIT;
    return VehicleType.CAR;
  }
}
