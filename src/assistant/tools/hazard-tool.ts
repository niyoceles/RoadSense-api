import { Injectable } from '@nestjs/common';
import {
  CreateReportDto,
  ReportType,
  Severity,
} from '../../modules/road-reports/dto/create-report.dto';
import { RoadReportsService } from '../../modules/road-reports/road-reports.service';

@Injectable()
export class HazardTool {
  constructor(private readonly reportsService: RoadReportsService) {}

  async findNearbyHazards(lat: number, lng: number, radiusMeters = 1500) {
    const safeRadius = Math.min(Math.max(radiusMeters, 50), 10000);
    try {
      return await this.reportsService.findNearby(lat, lng, safeRadius, 8);
    } catch (_) {
      // Assistant reads should degrade gracefully when PostGIS/Appwrite-backed
      // report storage is temporarily unreachable. Writes still fail explicitly.
      return [];
    }
  }

  createHazardReportDraft(
    type: ReportType,
    lat: number,
    lng: number,
    description?: string,
  ) {
    return {
      hazardType: type,
      lat,
      lng,
      description: description || `Reported by RoadSense AI Co-Pilot`,
      confidence: 0.82,
    };
  }

  async confirmHazardReport(payload: {
    hazardType: ReportType;
    lat: number;
    lng: number;
    description?: string;
  }) {
    const report: CreateReportDto = {
      type: payload.hazardType,
      severity: this.defaultSeverity(payload.hazardType),
      latitude: payload.lat,
      longitude: payload.lng,
      description: payload.description || 'Reported by RoadSense AI Co-Pilot',
      source: 'user',
    };
    return this.reportsService.create(report);
  }

  private defaultSeverity(type: ReportType): Severity {
    switch (type) {
      case ReportType.ACCIDENT:
      case ReportType.CRASH:
      case ReportType.FLOOD:
      case ReportType.CLOSURE:
        return Severity.HIGH;
      case ReportType.POTHOLE:
      case ReportType.BAD_ROAD:
        return Severity.MEDIUM;
      default:
        return Severity.MEDIUM;
    }
  }
}
