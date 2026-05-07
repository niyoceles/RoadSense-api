import { Injectable } from '@nestjs/common';

export enum CameraType {
  FIXED = 'fixed',
  MOBILE = 'mobile', // Usually crowdsourced
  RED_LIGHT = 'red_light',
}

export interface SpeedCamera {
  id: string;
  lat: number;
  lng: number;
  type: CameraType;
  speedLimit: number; // e.g., 60 km/h
  reportedBy?: string; // Null if it's a fixed official camera
  confidenceScore: number; // 1.0 for fixed, variable for crowdsourced
}

@Injectable()
export class CamerasService {
  // Real known/permanent speed camera locations in Kigali
  private readonly fixedCameras: SpeedCamera[] = [
    {
      id: 'kigali_cam_1',
      lat: -1.9442,
      lng: 30.0620,
      type: CameraType.FIXED,
      speedLimit: 60,
      confidenceScore: 1.0,
    },
    {
      id: 'kigali_cam_2',
      lat: -1.9567,
      lng: 30.0634,
      type: CameraType.FIXED,
      speedLimit: 60,
      confidenceScore: 1.0,
    },
    {
      id: 'kigali_cam_3',
      lat: -1.9612,
      lng: 30.1245,
      type: CameraType.FIXED,
      speedLimit: 80,
      confidenceScore: 1.0,
    },
  ];

  async getCamerasAlongRoute(routeLineString: any): Promise<SpeedCamera[]> {
    // In production this would be a PostGIS query. 
    // For now we return our seeded "official" cameras.
    return this.fixedCameras;
  }

  /**
   * Evaluates if the driver is approaching a camera too fast
   */
  checkApproachingCamera(currentSpeed: number, camera: SpeedCamera): string | null {
    // If the driver is going 10% over the limit near a camera, return a severe warning
    if (currentSpeed > camera.speedLimit * 1.1) {
      return `Warning! Speed camera ahead. Limit is ${camera.speedLimit} km/h. Slow down!`;
    }
    return `Speed camera reported ahead. Limit is ${camera.speedLimit} km/h.`;
  }
}
