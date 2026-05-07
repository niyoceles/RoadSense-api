import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';

@Injectable()
export class RoadReportsService {
  private reports: any[] = []; // In-memory storage

  constructor(private readonly gateway: RealTimeEventGateway) {}

  async create(createReportDto: CreateReportDto) {
    const newReport = {
      id: Math.random().toString(36).substring(7),
      ...createReportDto,
      createdAt: new Date(),
    };
    
    this.reports.push(newReport);

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

  async findNearby(lat: number, lng: number, radius: number) {
    // Basic bounding box check for nearby reports (simulating ST_DWithin)
    const radiusInDeg = radius / 111320; // Rough conversion
    return this.reports.filter(report => {
      const latDiff = Math.abs(report.latitude - lat);
      const lngDiff = Math.abs(report.longitude - lng);
      return latDiff < radiusInDeg && lngDiff < radiusInDeg;
    });
  }
}
