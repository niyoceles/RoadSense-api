import { Injectable } from '@nestjs/common';

export enum TrafficLevel {
  FLUID = 'fluid',     // Green
  MODERATE = 'moderate', // Orange
  CONGESTED = 'congested', // Red
  BLOCKED = 'blocked',    // Dark Red
}

@Injectable()
export class TrafficEngineService {
  /**
   * Determines traffic level based on speed relative to the road's speed limit
   */
  calculateTrafficLevel(currentSpeed: number, speedLimit: number): TrafficLevel {
    const ratio = currentSpeed / speedLimit;

    if (ratio >= 0.8) return TrafficLevel.FLUID;
    if (ratio >= 0.5) return TrafficLevel.MODERATE;
    if (ratio >= 0.2) return TrafficLevel.CONGESTED;
    return TrafficLevel.BLOCKED;
  }

  /**
   * Blends historical traffic data with real-time reports
   */
  getDynamicRouteWeight(segmentId: string, baseWeight: number): number {
    // In a real implementation, this would query Redis for current segment speed
    // and apply a multiplier to the route weight (A* cost)
    const trafficMultiplier = 1.2; // Example: 20% delay on this segment
    return baseWeight * trafficMultiplier;
  }
}
