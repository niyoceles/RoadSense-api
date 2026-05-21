import { TrafficEngineService } from './traffic-engine.service';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';
declare class TrafficUpdateDto {
    lat: number;
    lng: number;
    speedKmh: number;
    heading?: number;
    speedLimit?: number;
    accuracyMeters?: number;
    vehicleType?: string;
    sessionId?: string;
}
export declare class TrafficController {
    private readonly trafficEngine;
    private readonly events;
    constructor(trafficEngine: TrafficEngineService, events: RealTimeEventGateway);
    update(body: TrafficUpdateDto): Promise<{
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
        trafficLevel: import("./traffic-engine.service").TrafficLevel;
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
    nearby(lat: number, lng: number, radius?: number): Promise<any[]>;
    route(body: {
        route: Array<{
            lat: number;
            lng: number;
        }>;
        corridorMeters?: number;
    }): Promise<any[]>;
}
export {};
