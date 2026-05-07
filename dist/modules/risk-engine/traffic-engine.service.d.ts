export declare enum TrafficLevel {
    FLUID = "fluid",
    MODERATE = "moderate",
    CONGESTED = "congested",
    BLOCKED = "blocked"
}
export declare class TrafficEngineService {
    calculateTrafficLevel(currentSpeed: number, speedLimit: number): TrafficLevel;
    getDynamicRouteWeight(segmentId: string, baseWeight: number): number;
}
