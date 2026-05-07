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
}
export declare class CamerasService {
    private readonly fixedCameras;
    getCamerasAlongRoute(routeLineString: any): Promise<SpeedCamera[]>;
    checkApproachingCamera(currentSpeed: number, camera: SpeedCamera): string | null;
}
