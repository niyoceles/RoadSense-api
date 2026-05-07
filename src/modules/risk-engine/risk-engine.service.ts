import { Injectable } from '@nestjs/common';

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  MOTO = 'moto',
  TRUCK = 'truck',
}

export enum ReportSeverity {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

@Injectable()
export class RiskEngineService {
  /**
   * Calculates a risk score between 0.0 and 1.0
   * @param potholeDensity 0.0 to 1.0 (frequency of reports in a segment)
   * @param maxSeverity Max severity found in the area
   * @param vehicleType The type of vehicle to adjust risk for
   */
  calculateRisk(
    potholeDensity: number,
    maxSeverity: ReportSeverity,
    vehicleType: VehicleType,
  ): number {
    // Base risk from severity (1-4 scaled to 0-1)
    const severityRisk = maxSeverity / 4.0;
    
    // Combine with density (weighted)
    let baseRisk = (severityRisk * 0.6) + (potholeDensity * 0.4);

    // Vehicle specific modifiers
    const modifiers: Record<VehicleType, number> = {
      [VehicleType.SEDAN]: 1.2, // Higher risk for low ground clearance
      [VehicleType.SUV]: 0.8,   // Lower risk for robust suspension
      [VehicleType.MOTO]: 1.5,  // Very high risk (potholes are dangerous for bikes)
      [VehicleType.TRUCK]: 1.0, // Standard risk
    };

    const riskScore = baseRisk * (modifiers[vehicleType] || 1.0);

    // Clamp between 0 and 1
    return Math.min(Math.max(riskScore, 0), 1);
  }

  getRiskLevel(score: number): 'safe' | 'caution' | 'danger' {
    if (score < 0.3) return 'safe';
    if (score < 0.7) return 'caution';
    return 'danger';
  }
}
