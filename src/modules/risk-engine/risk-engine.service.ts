import { Injectable } from '@nestjs/common';

export enum VehicleType {
  CAR = 'CAR',
  WALKING = 'WALKING',
  TRANSIT = 'TRANSIT',
  CYCLING = 'CYCLING',
  MOTO = 'MOTO',
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
      [VehicleType.CAR]: 1.0,
      [VehicleType.WALKING]: 0.5,
      [VehicleType.TRANSIT]: 0.8,
      [VehicleType.CYCLING]: 1.2,
      [VehicleType.MOTO]: 1.5,
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
