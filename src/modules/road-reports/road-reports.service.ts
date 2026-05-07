import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CreateReportDto, ReportType } from './dto/create-report.dto';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';

@Injectable()
export class RoadReportsService {
  private reports: any[] = [];
  private readonly storagePath = join(process.cwd(), 'data', 'reports.json');
  private readonly ready: Promise<void>;

  constructor(private readonly gateway: RealTimeEventGateway) {
    this.ready = this.loadReports();
  }

  async create(createReportDto: CreateReportDto) {
    await this.ready;
    const newReport = {
      id: Math.random().toString(36).substring(7),
      ...createReportDto,
      createdAt: new Date(),
      isVerified: false,
      verificationCount: 0,
      dismissalCount: 0,
    };
    this.enrichCameraReport(newReport);

    this.reports.push(newReport);
    await this.saveReports();

    // Broadcast the new report in real-time
    this.gateway.server.emit('hazard_update', {
      type: newReport.type,
      location: { lat: newReport.latitude, lng: newReport.longitude },
      severity: newReport.severity,
      description: newReport.description,
      timestamp: newReport.createdAt,
    });

    return newReport;
  }

  async findAll() {
    await this.ready;
    return this.activeReports().sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async findNearby(lat: number, lng: number, radius: number) {
    await this.ready;
    // Basic bounding box check for nearby reports (simulating ST_DWithin)
    const radiusInDeg = radius / 111320; // Rough conversion
    return this.activeReports().filter((report) => {
      const latDiff = Math.abs(report.latitude - lat);
      const lngDiff = Math.abs(report.longitude - lng);
      return latDiff < radiusInDeg && lngDiff < radiusInDeg;
    });
  }

  async findNearbyByTypes(
    lat: number,
    lng: number,
    radius: number,
    types: ReportType[],
  ) {
    const nearby = await this.findNearby(lat, lng, radius);
    return nearby.filter((report) => types.includes(report.type));
  }

  async verify(id: string) {
    await this.ready;
    const report = this.reports.find((item) => item.id === id);
    if (!report) return null;

    report.isVerified = true;
    report.verificationCount = (report.verificationCount || 0) + 1;
    if (report.type === ReportType.SPEED_CAMERA) {
      report.cameraType = report.cameraType === 'red_light' ? 'red_light' : 'fixed';
      report.expiresAt = null;
      report.confidenceScore = this.cameraConfidence(report);
    }
    report.updatedAt = new Date();
    await this.saveReports();
    return report;
  }

  async dismiss(id: string) {
    await this.ready;
    const report = this.reports.find((item) => item.id === id);
    if (!report) return null;

    report.dismissalCount = (report.dismissalCount || 0) + 1;
    report.confidenceScore =
      report.type === ReportType.SPEED_CAMERA
        ? this.cameraConfidence(report)
        : report.confidenceScore;
    report.updatedAt = new Date();
    await this.saveReports();
    return report;
  }

  async delete(id: string) {
    await this.ready;
    const before = this.reports.length;
    this.reports = this.reports.filter((item) => item.id !== id);
    if (this.reports.length !== before) {
      await this.saveReports();
    }
    return { deleted: this.reports.length !== before };
  }

  private async loadReports() {
    try {
      const raw = await fs.readFile(this.storagePath, 'utf8');
      this.reports = JSON.parse(raw);
    } catch (error) {
      this.reports = [];
      await this.saveReports();
    }
  }

  private async saveReports() {
    await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
    await fs.writeFile(
      this.storagePath,
      JSON.stringify(this.reports, null, 2),
      'utf8',
    );
  }

  private activeReports() {
    const now = Date.now();
    return this.reports.filter((report) => {
      if (!report.expiresAt) return true;
      return new Date(report.expiresAt).getTime() > now;
    });
  }

  private enrichCameraReport(report: any) {
    if (report.type !== ReportType.SPEED_CAMERA) return;

    report.cameraType = report.cameraType || 'mobile';
    report.speedLimit =
      report.speedLimit || this.extractSpeedLimit(report.description) || 60;
    report.directionDegrees =
      typeof report.directionDegrees === 'number'
        ? this.normalizeDegrees(report.directionDegrees)
        : null;
    report.roadSegmentId =
      report.roadSegmentId ||
      this.segmentIdForLocation(report.latitude, report.longitude);
    report.confidenceScore = this.cameraConfidence(report);

    if (report.cameraType === 'mobile' && !report.expiresAt) {
      report.expiresAt = new Date(
        Date.now() + 2 * 60 * 60 * 1000,
      ).toISOString();
    }
  }

  private cameraConfidence(report: any): number {
    const confirmations = report.verificationCount || 0;
    const dismissals = report.dismissalCount || 0;
    const verifiedBoost = report.isVerified ? 0.25 : 0;
    const score = 0.55 + verifiedBoost + confirmations * 0.08 - dismissals * 0.2;
    return Math.min(Math.max(score, 0.1), 0.98);
  }

  private extractSpeedLimit(description?: string): number | null {
    const match = description?.match(/(\d{2,3})\s?(km\/h|kph|kmh)/i);
    if (!match) return null;
    return Number(match[1]);
  }

  private normalizeDegrees(value: number): number {
    return ((Math.round(value) % 360) + 360) % 360;
  }

  private segmentIdForLocation(lat: number, lng: number): string {
    const gridLat = Math.round(lat * 1000) / 1000;
    const gridLng = Math.round(lng * 1000) / 1000;
    return `${gridLat},${gridLng}`;
  }
}
