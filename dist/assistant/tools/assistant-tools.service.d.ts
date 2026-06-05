import { ReportType } from '../../modules/road-reports/dto/create-report.dto';
import { HazardTool } from './hazard-tool';
import { RoutingTool } from './routing-tool';
import { GeocodingTool } from './geocoding-tool';
import { SafetyTool } from './safety-tool';
export declare class AssistantToolsService {
    private readonly hazardTool;
    private readonly routingTool;
    private readonly geocodingTool;
    private readonly safetyTool;
    constructor(hazardTool: HazardTool, routingTool: RoutingTool, geocodingTool: GeocodingTool, safetyTool: SafetyTool);
    findNearbyHazards(lat: number, lng: number, radiusMeters?: number): Promise<any[]>;
    createHazardReportDraft(type: ReportType, lat: number, lng: number, description?: string): {
        hazardType: ReportType;
        lat: number;
        lng: number;
        description: string;
        confidence: number;
    };
    confirmHazardReport(payload: {
        hazardType: ReportType;
        lat: number;
        lng: number;
        description?: string;
    }): Promise<any>;
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
    getSafetySummary(lat?: number, lng?: number, radiusMeters?: number): Promise<{
        hasLocation: boolean;
        summary: string;
        hazardCount?: undefined;
    } | {
        hasLocation: boolean;
        hazardCount: number;
        summary: string;
    }>;
    geocodeDestination(query: string): Promise<{
        lat: any;
        lng: any;
        name: any;
        address: string;
    }>;
}
