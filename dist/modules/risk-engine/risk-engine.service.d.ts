export declare enum VehicleType {
    CAR = "CAR",
    WALKING = "WALKING",
    TRANSIT = "TRANSIT",
    CYCLING = "CYCLING",
    MOTO = "MOTO"
}
export declare enum ReportSeverity {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4
}
export declare class RiskEngineService {
    calculateRisk(potholeDensity: number, maxSeverity: ReportSeverity, vehicleType: VehicleType): number;
    getRiskLevel(score: number): 'safe' | 'caution' | 'danger';
}
