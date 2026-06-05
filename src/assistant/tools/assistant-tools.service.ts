import { Injectable } from '@nestjs/common';
import { ReportType } from '../../modules/road-reports/dto/create-report.dto';
import { HazardTool } from './hazard-tool';
import { RoutingTool } from './routing-tool';
import { GeocodingTool } from './geocoding-tool';
import { SafetyTool } from './safety-tool';

@Injectable()
export class AssistantToolsService {
  constructor(
    private readonly hazardTool: HazardTool,
    private readonly routingTool: RoutingTool,
    private readonly geocodingTool: GeocodingTool,
    private readonly safetyTool: SafetyTool,
  ) {}

  findNearbyHazards(lat: number, lng: number, radiusMeters?: number) {
    return this.hazardTool.findNearbyHazards(lat, lng, radiusMeters);
  }

  createHazardReportDraft(
    type: ReportType,
    lat: number,
    lng: number,
    description?: string,
  ) {
    return this.hazardTool.createHazardReportDraft(type, lat, lng, description);
  }

  confirmHazardReport(payload: {
    hazardType: ReportType;
    lat: number;
    lng: number;
    description?: string;
  }) {
    return this.hazardTool.confirmHazardReport(payload);
  }

  calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    vehicleType?: string,
  ) {
    return this.routingTool.calculateRoute(origin, destination, vehicleType);
  }

  explainRouteChange(activeRouteId?: string) {
    return this.routingTool.explainRouteChange(activeRouteId);
  }

  getSafetySummary(lat?: number, lng?: number, radiusMeters?: number) {
    return this.safetyTool.getSafetySummary(lat, lng, radiusMeters);
  }

  geocodeDestination(query: string) {
    return this.geocodingTool.geocodeDestination(query);
  }
}
