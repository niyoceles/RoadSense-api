import { CreateReportDto } from './dto/create-report.dto';
import { RoadReportsService } from './road-reports.service';
export declare class RoadReportsController {
    private readonly reportsService;
    constructor(reportsService: RoadReportsService);
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
