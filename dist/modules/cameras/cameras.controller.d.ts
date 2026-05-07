import { CamerasService } from './cameras.service';
export declare class CamerasController {
    private readonly camerasService;
    constructor(camerasService: CamerasService);
    getNearbyCameras(lat: number, lng: number, radius?: number): Promise<import("./cameras.service").SpeedCamera[]>;
}
