export declare enum VehicleType {
    SEDAN = "sedan",
    SUV = "suv",
    MOTO = "moto",
    TRUCK = "truck"
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
