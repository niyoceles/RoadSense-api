import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RiskEngineService, VehicleType } from '../risk-engine/risk-engine.service';
import { TrafficEngineService } from '../risk-engine/traffic-engine.service';
export interface Coordinates {
    lat: number;
    lng: number;
}
export declare class RoutingService {
    private readonly httpService;
    private readonly configService;
    private readonly riskEngine;
    private readonly trafficEngine;
    private readonly logger;
    private readonly valhallaUrl;
    constructor(httpService: HttpService, configService: ConfigService, riskEngine: RiskEngineService, trafficEngine: TrafficEngineService);
    getSpeedLimit(lat: number, lng: number): Promise<number>;
    calculateOptimalRoute(origin: Coordinates, destination: Coordinates, vehicleType: VehicleType, waypoints?: Coordinates[]): Promise<{
        id: string;
        distanceMeters: number;
        estimatedTimeSeconds: number;
        polyline: string;
        routeCoordinates: Coordinates[];
        maneuvers: {
            instruction: string;
            verbalInstruction: string;
            maneuver: string;
            distanceMeters: number;
            durationSeconds: number;
            beginShapeIndex: number;
            endShapeIndex: number;
            startLocation: Coordinates;
            endLocation: Coordinates;
            streetNames: any[];
        }[];
        safetyRiskScore: number;
        riskLevel: string;
        alternatives: {
            id: string;
            label: string;
            distanceMeters: number;
            estimatedTimeSeconds: number;
            routeCoordinates: Coordinates[];
            maneuvers: any[];
            safetyRiskScore: number;
            riskLevel: string;
        }[];
    } | {
        id: string;
        distanceMeters: number;
        estimatedTimeSeconds: any;
        polyline: string;
        routeCoordinates: Coordinates[];
        maneuvers: any[];
        safetyRiskScore: number;
        riskLevel: "safe" | "caution" | "danger";
        summary: any;
        alternatives: any[];
    }>;
    private mapVehicleToCosting;
    private evaluatePathRisk;
    private getFallbackRoute;
    private routeOptionFromTrip;
    private buildRouteGeometryAndManeuvers;
    private mapValhallaManeuverType;
    private decodePolyline6;
}
