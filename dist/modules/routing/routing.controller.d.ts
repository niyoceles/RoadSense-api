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
        id: string;
        distanceMeters: number;
        estimatedTimeSeconds: number;
        polyline: string;
        routeCoordinates: import("./routing.service").Coordinates[];
        maneuvers: {
            instruction: string;
            verbalInstruction: string;
            maneuver: string;
            distanceMeters: number;
            durationSeconds: number;
            beginShapeIndex: number;
            endShapeIndex: number;
            startLocation: import("./routing.service").Coordinates;
            endLocation: import("./routing.service").Coordinates;
            streetNames: any[];
        }[];
        safetyRiskScore: number;
        riskLevel: string;
        alternatives: {
            id: string;
            label: string;
            distanceMeters: number;
            estimatedTimeSeconds: number;
            routeCoordinates: import("./routing.service").Coordinates[];
            maneuvers: any[];
            safetyRiskScore: number;
            riskLevel: string;
        }[];
    } | {
        id: string;
        distanceMeters: number;
        estimatedTimeSeconds: any;
        polyline: string;
        routeCoordinates: import("./routing.service").Coordinates[];
        maneuvers: any[];
        safetyRiskScore: number;
        riskLevel: "safe" | "caution" | "danger";
        summary: any;
        alternatives: any[];
    }>;
    getSpeedLimit(location: {
        lat: number;
        lng: number;
    }): Promise<{
        speedLimit: number;
    }>;
}
export {};
