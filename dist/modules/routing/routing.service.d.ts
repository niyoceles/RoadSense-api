import { RiskEngineService, VehicleType } from '../risk-engine/risk-engine.service';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';
interface Coordinates {
    lat: number;
    lng: number;
}
export declare class RoutingService {
    private readonly riskEngine;
    private readonly trafficEngine;
    constructor(riskEngine: RiskEngineService, trafficEngine: TrafficEngineService);
    calculateOptimalRoute(origin: Coordinates, destination: Coordinates, vehicleType: VehicleType, waypoints?: Coordinates[]): Promise<{
        primaryRoute: {
            estimatedTimeSeconds: number;
            safetyRiskScore: number;
            totalCost: number;
            riskLevel: "safe" | "caution" | "danger";
            id: string;
            distanceMeters: number;
            baseTimeSeconds: number;
            segments: {
                id: string;
                baseTime: number;
            }[];
        };
        alternatives: {
            estimatedTimeSeconds: number;
            safetyRiskScore: number;
            totalCost: number;
            riskLevel: "safe" | "caution" | "danger";
            id: string;
            distanceMeters: number;
            baseTimeSeconds: number;
            segments: {
                id: string;
                baseTime: number;
            }[];
        }[];
    }>;
    private fetchCandidateRoutes;
    private getRealTimeSpeed;
}
export {};
