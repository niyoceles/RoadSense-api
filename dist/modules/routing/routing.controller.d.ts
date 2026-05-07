import { RoutingService } from './routing.service';
import { VehicleType } from '../risk-engine/risk-engine.service';
declare class RouteRequestDto {
    origin: {
        lat: number;
        lng: number;
    };
    destination: {
        lat: number;
        lng: number;
    };
    vehicleType: VehicleType;
    waypoints?: Array<{
        lat: number;
        lng: number;
    }>;
}
export declare class RoutingController {
    private readonly routingService;
    constructor(routingService: RoutingService);
    calculateRoute(request: RouteRequestDto): Promise<{
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
}
export {};
