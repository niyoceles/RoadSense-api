export declare enum TrafficLevel {
    FLUID = "fluid",
    MODERATE = "moderate",
    CONGESTED = "congested",
    BLOCKED = "blocked"
}
export declare class TrafficEngineService {
    private readonly storagePath;
    private readonly ready;
    private segments;
    constructor();
    calculateTrafficLevel(currentSpeed: number, speedLimit: number): TrafficLevel;
    getDynamicRouteWeight(segmentId: string, baseWeight: number): number;
    recordTrafficUpdate(update: {
        lat: number;
        lng: number;
        speedKmh: number;
        heading?: number;
        speedLimit?: number;
    }): Promise<{
        segmentId: string;
        centerLat: number;
        centerLng: number;
        avgSpeedKmh: number;
        speedLimit: any;
        trafficLevel: TrafficLevel;
        sampleCount: any;
        lastHeading: number;
        updatedAt: Date;
    }>;
    findNearby(lat: number, lng: number, radiusMeters?: number): Promise<any[]>;
    getTrafficLevelAt(lat: number, lng: number): TrafficLevel;
    segmentIdForLocation(lat: number, lng: number): string;
    private roundToGrid;
    private multiplierForLevel;
    private loadSegments;
    private saveSegments;
    private distanceMeters;
}
