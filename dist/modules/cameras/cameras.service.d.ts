import { RoadReportsService } from '../road-reports/road-reports.service';
export declare enum CameraType {
    FIXED = "fixed",
    MOBILE = "mobile",
    RED_LIGHT = "red_light"
}
export interface SpeedCamera {
    id: string;
    lat: number;
    lng: number;
    type: CameraType;
    speedLimit: number;
    reportedBy?: string;
    confidenceScore: number;
    directionDegrees?: number;
    roadSegmentId?: string;
    expiresAt?: string | null;
    isVerified?: boolean;
    description?: string;
}
export declare class CamerasService {
    private readonly reportsService;
    constructor(reportsService: RoadReportsService);
    getNearbyCameras(lat: number, lng: number, radius: number): Promise<SpeedCamera[]>;
    getCamerasAlongRoute(routeLineString: any): Promise<SpeedCamera[]>;
    checkApproachingCamera(currentSpeed: number, camera: SpeedCamera): string | null;
    private calculateConfidence;
    private cameraTypeFromReport;
    private extractSpeedLimit;
}
