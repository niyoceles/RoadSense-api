import { RoutingService } from '../../modules/routing/routing.service';
export declare class RoutingTool {
    private readonly routingService;
    constructor(routingService: RoutingService);
    calculateRoute(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }, vehicleType?: string): Promise<{
        id: string;
        distanceMeters: number;
        estimatedTimeSeconds: number;
        polyline: string;
        routeCoordinates: import("../../modules/routing/routing.service").Coordinates[];
        maneuvers: {
            instruction: string;
            verbalInstruction: string;
            maneuver: string;
            distanceMeters: number;
            durationSeconds: number;
            beginShapeIndex: number;
            endShapeIndex: number;
            startLocation: import("../../modules/routing/routing.service").Coordinates;
            endLocation: import("../../modules/routing/routing.service").Coordinates;
            streetNames: any[];
        }[];
        safetyRiskScore: number;
        riskLevel: string;
        alternatives: {
            id: string;
            label: string;
            distanceMeters: number;
            estimatedTimeSeconds: number;
            routeCoordinates: import("../../modules/routing/routing.service").Coordinates[];
            maneuvers: any[];
            safetyRiskScore: number;
            riskLevel: string;
        }[];
    } | {
        id: string;
        distanceMeters: number;
        estimatedTimeSeconds: any;
        polyline: string;
        routeCoordinates: import("../../modules/routing/routing.service").Coordinates[];
        maneuvers: any[];
        safetyRiskScore: number;
        riskLevel: "safe" | "caution" | "danger";
        summary: any;
        alternatives: any[];
    }>;
    explainRouteChange(activeRouteId?: string): {
        hasRouteContext: boolean;
        explanation: string;
        activeRouteId?: undefined;
    } | {
        hasRouteContext: boolean;
        explanation: string;
        activeRouteId: string;
    };
    private toVehicleType;
}
