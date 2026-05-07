import { Injectable } from '@nestjs/common';
import { RiskEngineService, VehicleType, ReportSeverity } from '../risk-engine/risk-engine.service';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';

interface Coordinates { lat: number; lng: number }

@Injectable()
export class RoutingService {
  constructor(
    private readonly riskEngine: RiskEngineService,
    private readonly trafficEngine: TrafficEngineService,
  ) {}

  /**
   * Core routing algorithm that evaluates multiple potential paths
   * and selects the optimal one based on Time, Traffic, and Vehicle Safety.
   */
  async calculateOptimalRoute(
    origin: Coordinates,
    destination: Coordinates,
    vehicleType: VehicleType,
    waypoints?: Coordinates[]
  ) {
    // 1. Fetch potential routes from Base Engine (e.g., OSRM / GraphHopper)
    const candidateRoutes = this.fetchCandidateRoutes(origin, destination, waypoints);

    // 2. Score each route
    const scoredRoutes = candidateRoutes.map(route => {
      let totalCost = 0;
      let totalTime = route.baseTimeSeconds;
      let maxRiskEncountered = 0;

      // Evaluate each segment of the route
      for (const segment of route.segments) {
        // A. Real-Time Traffic Penalty
        const currentSpeed = this.getRealTimeSpeed(segment.id);
        const trafficMultiplier = this.trafficEngine.getDynamicRouteWeight(segment.id, 1.0);
        const segmentTime = segment.baseTime * trafficMultiplier;
        totalTime += segmentTime - segment.baseTime;

        // B. Vehicle-Aware Safety Penalty (RQI)
        // Simulate fetching segment quality data
        const potholeDensity = Math.random(); // 0 to 1
        const maxSeverity = ReportSeverity.MEDIUM;
        
        const riskScore = this.riskEngine.calculateRisk(potholeDensity, maxSeverity, vehicleType);
        if (riskScore > maxRiskEncountered) maxRiskEncountered = riskScore;

        // Apply cost penalty if risk is high for this specific vehicle
        // e.g., Sedan trying to go over a heavily potholed road
        const riskPenalty = 1.0 + (riskScore * 2); // Up to 3x cost penalty for dangerous roads
        
        totalCost += segmentTime * riskPenalty;
      }

      return {
        ...route,
        estimatedTimeSeconds: totalTime,
        safetyRiskScore: maxRiskEncountered,
        totalCost,
        riskLevel: this.riskEngine.getRiskLevel(maxRiskEncountered)
      };
    });

    // 3. Sort by totalCost (lowest is best)
    scoredRoutes.sort((a, b) => a.totalCost - b.totalCost);

    return {
      primaryRoute: scoredRoutes[0],
      alternatives: scoredRoutes.slice(1, 3)
    };
  }

  // --- Mocks for external dependencies ---

  private fetchCandidateRoutes(origin: Coordinates, dest: Coordinates, waypoints?: Coordinates[]) {
    return [
      {
        id: 'route_1_fastest',
        distanceMeters: 5000,
        baseTimeSeconds: 600, // 10 mins
        segments: [{ id: 'seg_a', baseTime: 300 }, { id: 'seg_b', baseTime: 300 }]
      },
      {
        id: 'route_2_safest',
        distanceMeters: 5500,
        baseTimeSeconds: 660, // 11 mins
        segments: [{ id: 'seg_c', baseTime: 330 }, { id: 'seg_d', baseTime: 330 }]
      }
    ];
  }

  private getRealTimeSpeed(segmentId: string): number {
    return 45; // km/h (Mock)
  }
}
