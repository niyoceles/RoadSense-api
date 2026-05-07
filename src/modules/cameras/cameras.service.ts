import { Injectable } from '@nestjs/common';
import { ReportType } from '../road-reports/dto/create-report.dto';
import { RoadReportsService } from '../road-reports/road-reports.service';

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
  directionDegrees?: number;
  roadSegmentId?: string;
  expiresAt?: string | null;
  isVerified?: boolean;
  description?: string;
}

@Injectable()
export class CamerasService {
  constructor(private readonly reportsService: RoadReportsService) {}

  async getNearbyCameras(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<SpeedCamera[]> {
    const reports = await this.reportsService.findNearbyByTypes(
      lat,
      lng,
      radius,
      [ReportType.SPEED_CAMERA],
    );

    return reports.map((report) => ({
      id: report.id,
      lat: report.latitude,
      lng: report.longitude,
      type: this.cameraTypeFromReport(report),
      speedLimit: report.speedLimit || this.extractSpeedLimit(report.description),
      reportedBy: report.reportedBy,
      confidenceScore: report.confidenceScore ?? this.calculateConfidence(report),
      directionDegrees: report.directionDegrees,
      roadSegmentId: report.roadSegmentId,
      expiresAt: report.expiresAt,
      isVerified: report.isVerified,
      description: report.description,
    }));
  }

  async getCamerasAlongRoute(routeLineString: any): Promise<SpeedCamera[]> {
    // Route-aware camera matching should use snapped route geometry later.
    // Until then, do not return seeded fake cameras.
    return [];
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

  private calculateConfidence(report: any): number {
    const confirmations = report.verificationCount || 0;
    const dismissals = report.dismissalCount || 0;
    const score = 0.55 + confirmations * 0.1 - dismissals * 0.2;
    return Math.min(Math.max(score, 0.1), 0.95);
  }

  private cameraTypeFromReport(report: any): CameraType {
    if (report.cameraType === CameraType.FIXED) return CameraType.FIXED;
    if (report.cameraType === CameraType.RED_LIGHT) return CameraType.RED_LIGHT;
    return CameraType.MOBILE;
  }

  private extractSpeedLimit(description?: string): number {
    const match = description?.match(/(\d{2,3})\s?(km\/h|kph|kmh)/i);
    if (!match) return 60;
    return Number(match[1]);
  }
}
