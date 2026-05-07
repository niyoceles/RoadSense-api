import { CreateReportDto, ReportType } from './dto/create-report.dto';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';
export declare class RoadReportsService {
    private readonly gateway;
    private reports;
    private readonly storagePath;
    private readonly ready;
    constructor(gateway: RealTimeEventGateway);
    create(createReportDto: CreateReportDto): Promise<{
        createdAt: Date;
        isVerified: boolean;
        verificationCount: number;
        dismissalCount: number;
        type: ReportType;
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
    findNearbyByTypes(lat: number, lng: number, radius: number, types: ReportType[]): Promise<any[]>;
    verify(id: string): Promise<any>;
    dismiss(id: string): Promise<any>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
    private loadReports;
    private saveReports;
    private activeReports;
    private enrichCameraReport;
    private cameraConfidence;
    private extractSpeedLimit;
    private normalizeDegrees;
    private segmentIdForLocation;
}
