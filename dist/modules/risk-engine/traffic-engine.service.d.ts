import { DatabaseService } from '../database/database.service';
export declare enum TrafficLevel {
    FLUID = "fluid",
    MODERATE = "moderate",
    CONGESTED = "congested",
    BLOCKED = "blocked"
}
export declare class TrafficEngineService {
    private readonly database;
    private readonly storagePath;
    private readonly ready;
    private segments;
    constructor(database: DatabaseService);
    calculateTrafficLevel(currentSpeed: number, speedLimit: number): TrafficLevel;
    getDynamicRouteWeight(segmentId: string, baseWeight: number): number;
    recordTrafficUpdate(update: {
        lat: number;
        lng: number;
        speedKmh: number;
        heading?: number;
        speedLimit?: number;
        accuracyMeters?: number;
        vehicleType?: string;
        sessionId?: string;
    }): Promise<{
        accepted: boolean;
        segmentId: any;
        internalSegmentId: any;
        osmWayId: any;
        roadName: any;
        centerLat: number;
        centerLng: number;
        avgSpeedKmh: number;
        speedLimit: number;
        trafficLevel: any;
        confidenceScore: number;
        sampleCount: number;
        updatedAt: any;
    } | {
        segmentId: string;
        centerLat: number;
        centerLng: number;
        avgSpeedKmh: number;
        speedLimit: any;
        trafficLevel: TrafficLevel;
        confidenceScore: number;
        sampleCount: any;
        lastHeading: number;
        vehicleType: string;
        anonymizedSessionId: string;
        updatedAt: Date;
    } | {
        accepted: boolean;
        rejectionReason: string;
    }>;
    findNearby(lat: number, lng: number, radiusMeters?: number): Promise<any[]>;
    findNearRoute(route: Array<{
        lat: number;
        lng: number;
    }>, corridorMeters?: number): Promise<any[]>;
    getTrafficLevelAt(lat: number, lng: number): TrafficLevel;
    segmentIdForLocation(lat: number, lng: number): string;
    private roundToGrid;
    private validateSample;
    private matchRoadSegment;
    private recordTrafficUpdateInDatabase;
    private matchRoadSegmentInDatabase;
    private findNearbyInDatabase;
    private findNearRouteInDatabase;
    private databaseSegmentToPublic;
    private roundToRoadGrid;
    private normalizeDegrees;
    private classifyWithConfidence;
    private confidenceForSegment;
    private multiplierForLevel;
    private loadSegments;
    private saveSegments;
    private distanceMeters;
    private distanceToPolyline;
    private distanceToSegment;
    private clamp;
}
