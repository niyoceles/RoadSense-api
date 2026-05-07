import { TrafficEngineService } from './traffic-engine.service';
declare class TrafficUpdateDto {
    lat: number;
    lng: number;
    speedKmh: number;
    heading?: number;
    speedLimit?: number;
}
export declare class TrafficController {
    private readonly trafficEngine;
    constructor(trafficEngine: TrafficEngineService);
    update(body: TrafficUpdateDto): Promise<{
        segmentId: string;
        centerLat: number;
        centerLng: number;
        avgSpeedKmh: number;
        speedLimit: any;
        trafficLevel: import("./traffic-engine.service").TrafficLevel;
        sampleCount: any;
        lastHeading: number;
        updatedAt: Date;
    }>;
    nearby(lat: number, lng: number, radius?: number): Promise<any[]>;
}
export {};
