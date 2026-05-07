import { CreateReportDto } from './dto/create-report.dto';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';
export declare class RoadReportsService {
    private readonly gateway;
    private reports;
    constructor(gateway: RealTimeEventGateway);
    create(createReportDto: CreateReportDto): Promise<{
        createdAt: Date;
        type: import("./dto/create-report.dto").ReportType;
        severity: import("./dto/create-report.dto").Severity;
        description?: string;
        latitude: number;
        longitude: number;
        imageUrl?: string;
        id: string;
    }>;
    findNearby(lat: number, lng: number, radius: number): Promise<any[]>;
}
