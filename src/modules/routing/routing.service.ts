import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { RiskEngineService, VehicleType } from '../risk-engine/risk-engine.service';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';

export interface Coordinates { lat: number; lng: number }

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly valhallaUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly riskEngine: RiskEngineService,
    private readonly trafficEngine: TrafficEngineService,
  ) {
    this.valhallaUrl = this.configService.get<string>('VALHALLA_URL', 'http://valhalla:8002');
  }

  async getSpeedLimit(lat: number, lng: number): Promise<number> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.valhallaUrl}/trace_attributes`, {
          params: {
            json: JSON.stringify({
              shape: [{ lat, lon: lng }],
              costing: 'auto',
              shape_match: 'map_snap',
              filters: {
                attributes: ['edge.speed_limit'],
                action: 'include',
              },
            }),
          },
        })
      );
      // Valhalla returns speed limit in km/h by default in trace_attributes
      return response.data.edges?.[0]?.speed_limit || 60;
    } catch (error) {
      this.logger.warn(`Speed limit lookup failed at ${lat},${lng}: ${error.message}`);
      return 60;
    }
  }

  async calculateOptimalRoute(
    origin: Coordinates,
    destination: Coordinates,
    vehicleType: VehicleType,
    waypoints?: Coordinates[]
  ) {
    try {
      // 1. Fetch real route from Valhalla
      const locations = [
        { lat: origin.lat, lon: origin.lng },
        ...(waypoints?.map(w => ({ lat: w.lat, lon: w.lng })) || []),
        { lat: destination.lat, lon: destination.lng }
      ];

      // Map our vehicle types to Valhalla costing profiles
      const costing = this.mapVehicleToCosting(vehicleType);

      const response = await firstValueFrom(
        this.httpService.get(`${this.valhallaUrl}/route`, {
          params: {
            json: JSON.stringify({
              locations,
              costing,
              units: 'kilometers',
              alternates: 2,
              filters: {
                attributes: [
                  'edge.speed_limit',
                  'edge.name',
                  'edge.length',
                  'edge.weighted_grade',
                ],
              },
            }),
          },
        })
      );

      const valhallaRoute = response.data.trip;
      const alternateTrips = response.data.alternates || [];

      // 2. Enhance with our Risk and Traffic Intelligence
      // In a full implementation, we would iterate through legs/maneuvers
      // For now, we apply global scoring based on the summary
      const baseTime = valhallaRoute.summary.time;
      const distance = valhallaRoute.summary.length;

      // Simulate segment analysis for risk
      const maxRisk = this.evaluatePathRisk(origin, destination, vehicleType);

      const { shape, routeCoordinates, maneuvers, totalTrafficDurationSec } =
        this.buildRouteGeometryAndManeuvers(valhallaRoute.legs || []);
      
      // Use the traffic-adjusted duration if available
      const estimatedTimeSeconds = totalTrafficDurationSec > 0 
        ? totalTrafficDurationSec 
        : baseTime;
      const alternatives = [
        this.routeOptionFromTrip(valhallaRoute, 'Best route', maxRisk),
        ...alternateTrips.map((alternate: any, index: number) =>
          this.routeOptionFromTrip(
            alternate.trip || alternate,
            `Alternative ${index + 1}`,
            maxRisk,
          ),
        ),
      ].filter((route) => route.routeCoordinates.length > 0);

      return {
        id: `route_${Date.now()}`,
        distanceMeters: distance * 1000,
        estimatedTimeSeconds: baseTime,
        polyline: shape,              // kept for backward compat
        routeCoordinates,             // decoded [{lat, lng}] array
        maneuvers,                    // turn-by-turn instructions for the app
        safetyRiskScore: maxRisk,
        riskLevel: this.riskEngine.getRiskLevel(maxRisk),
        summary: valhallaRoute.summary,
        alternatives,
      };
    } catch (error) {
      this.logger.error(`Routing error: ${error.message}`);
      return this.getFallbackRoute(origin, destination);
    }
  }

  private mapVehicleToCosting(type: VehicleType): string {
    switch (type) {
      case VehicleType.CAR:
        return 'auto';
      case VehicleType.WALKING:
        return 'pedestrian';
      case VehicleType.CYCLING:
        return 'bicycle';
      case VehicleType.TRANSIT:
        return 'transit';
      case VehicleType.MOTO:
        return 'motorcycle';
      default:
        return 'auto';
    }
  }

  private evaluatePathRisk(origin: Coordinates, dest: Coordinates, vehicle: VehicleType): number {
    // Placeholder for real spatial intersection with PostGIS reports
    return Math.random() * 0.5; // Low to medium risk
  }

  private getFallbackRoute(origin: Coordinates, dest: Coordinates) {
    return {
      id: 'fallback_route',
      distanceMeters: 5000,
      estimatedTimeSeconds: 600,
      polyline: '',
      routeCoordinates: [origin, dest],
      maneuvers: [
        {
          instruction: 'Follow the route to your destination',
          verbalInstruction: 'Follow the route to your destination',
          maneuver: 'straight',
          distanceMeters: 5000,
          durationSeconds: 600,
          beginShapeIndex: 0,
          endShapeIndex: 1,
          startLocation: origin,
          endLocation: dest,
          streetNames: [],
        },
      ],
      safetyRiskScore: 0.1,
      riskLevel: 'LOW',
      alternatives: [
        {
          id: 'fallback_route',
          label: 'Fallback route',
          distanceMeters: 5000,
          estimatedTimeSeconds: 600,
          routeCoordinates: [origin, dest],
          maneuvers: [],
          safetyRiskScore: 0.1,
          riskLevel: 'LOW',
        },
      ],
    };
  }

  private routeOptionFromTrip(trip: any, label: string, riskScore: number) {
    const { shape, routeCoordinates, maneuvers } =
      this.buildRouteGeometryAndManeuvers(trip.legs || []);
    const summary = trip.summary || {};
    const distanceMeters = Math.round((summary.length || 0) * 1000);
    const estimatedTimeSeconds = Math.round(summary.time || 0);

    return {
      id: `${label.toLowerCase().replace(/\s+/g, '_')}_${distanceMeters}_${estimatedTimeSeconds}`,
      label,
      distanceMeters,
      estimatedTimeSeconds,
      polyline: shape,
      routeCoordinates,
      maneuvers,
      safetyRiskScore: riskScore,
      riskLevel: this.riskEngine.getRiskLevel(riskScore),
      summary,
    };
  }

  private buildRouteGeometryAndManeuvers(legs: any[]) {
    const routeCoordinates: Coordinates[] = [];
    const maneuvers: any[] = [];
    const shapes: string[] = [];
    let totalTrafficDurationSec = 0;

    for (const leg of legs) {
      const legShape = leg.shape || '';
      const legPoints = this.decodePolyline6(legShape);
      const offset = routeCoordinates.length;

      shapes.push(legShape);
      routeCoordinates.push(...legPoints);

      for (const maneuver of leg.maneuvers || []) {
        const beginShapeIndex = offset + (maneuver.begin_shape_index || 0);
        const endShapeIndex = offset + (maneuver.end_shape_index || maneuver.begin_shape_index || 0);
        const startLocation = routeCoordinates[beginShapeIndex] || legPoints[0];
        const endLocation =
          routeCoordinates[endShapeIndex] ||
          legPoints[legPoints.length - 1] ||
          startLocation;

        const segmentId = this.trafficEngine.segmentIdForLocation(startLocation.lat, startLocation.lng);
        const trafficLevel = this.trafficEngine.getTrafficLevelAt(startLocation.lat, startLocation.lng);
        const baseDuration = Math.round(maneuver.time || 0);
        const adjustedDuration = this.trafficEngine.getDynamicRouteWeight(segmentId, baseDuration);

        maneuvers.push({
          instruction:
            maneuver.instruction ||
            maneuver.verbal_pre_transition_instruction ||
            'Continue',
          verbalInstruction:
            maneuver.verbal_pre_transition_instruction ||
            maneuver.instruction ||
            'Continue',
          maneuver: this.mapValhallaManeuverType(maneuver.type),
          distanceMeters: Math.round((maneuver.length || 0) * 1000),
          durationSeconds: adjustedDuration,
          trafficLevel,
          beginShapeIndex,
          endShapeIndex,
          startLocation,
          endLocation,
          streetNames: maneuver.street_names || [],
          lanes: maneuver.lanes || [],
        });

        totalTrafficDurationSec += adjustedDuration;
      }
    }

    return {
      shape: shapes[0] || '',
      routeCoordinates,
      maneuvers,
      totalTrafficDurationSec,
    };
  }

  private mapValhallaManeuverType(type: number): string {
    const maneuverTypes: Record<number, string> = {
      1: 'start',
      2: 'start-right',
      3: 'start-left',
      4: 'destination',
      5: 'destination-right',
      6: 'destination-left',
      7: 'continue',
      8: 'slight-right',
      9: 'right',
      10: 'sharp-right',
      11: 'u-turn-right',
      12: 'u-turn-left',
      13: 'sharp-left',
      14: 'left',
      15: 'slight-left',
      16: 'ramp-straight',
      17: 'ramp-right',
      18: 'ramp-left',
      19: 'exit-right',
      20: 'exit-left',
      21: 'stay-straight',
      22: 'stay-right',
      23: 'stay-left',
      24: 'merge',
      25: 'roundabout-enter',
      26: 'roundabout-exit',
      27: 'ferry-enter',
      28: 'ferry-exit',
      29: 'transit',
      30: 'transit-transfer',
      31: 'transit-remain-on',
      32: 'transit-connection-start',
      33: 'transit-connection-transfer',
      34: 'transit-connection-destination',
      35: 'post-transit-connection-destination',
      36: 'merge-right',
      37: 'merge-left',
    };

    return maneuverTypes[type] || 'continue';
  }

  /**
   * Decodes a Valhalla encoded_polyline6 string (6-decimal / 1e6 precision)
   * into an array of {lat, lng} objects.
   */
  private decodePolyline6(encoded: string): { lat: number; lng: number }[] {
    const points: { lat: number; lng: number }[] = [];
    let idx = 0, lat = 0, lng = 0;
    while (idx < encoded.length) {
      let b: number, shift = 0, result = 0;
      // latitude
      do {
        b = encoded.charCodeAt(idx++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      // longitude
      shift = 0; result = 0;
      do {
        b = encoded.charCodeAt(idx++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      points.push({ lat: lat / 1e6, lng: lng / 1e6 });
    }
    return points;
  }
}
