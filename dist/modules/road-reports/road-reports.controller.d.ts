import { CreateReportDto } from './dto/create-report.dto';
import { RoadReportsService } from './road-reports.service';
export declare class RoadReportsController {
    private readonly reportsService;
    constructor(reportsService: RoadReportsService);
    create(createReportDto: CreateReportDto): Promise<{
        createdAt: Date;
        isVerified: boolean;
        verificationCount: number;
        dismissalCount: number;
        type: import("./dto/create-report.dto").ReportType;
        severity: import("./dto/create-report.dto").Severity;
        description?: string;
        latitude: number;
        longitude: number;
        imageUrl?: string;
        speedLimit?: number;
        directionDegrees?: number;
        roadSegmentId?: string;
        cameraType?: "fixed" | "mobile" | "red_light";
        reportedBy?: string;
        id: string;
    }>;
    findAll(): Promise<any[]>;
    findNearby(lat: number, lng: number, radius: number): Promise<any[]>;
    verify(id: string): Promise<any>;
    dismiss(id: string): Promise<any>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
}
