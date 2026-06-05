import { ReportType } from '../../modules/road-reports/dto/create-report.dto';
import { RoadReportsService } from '../../modules/road-reports/road-reports.service';
export declare class HazardTool {
    private readonly reportsService;
    constructor(reportsService: RoadReportsService);
    findNearbyHazards(lat: number, lng: number, radiusMeters?: number): Promise<any[]>;
    createHazardReportDraft(type: ReportType, lat: number, lng: number, description?: string): {
        hazardType: ReportType;
        lat: number;
        lng: number;
        description: string;
        confidence: number;
    };
    confirmHazardReport(payload: {
        hazardType: ReportType;
        lat: number;
        lng: number;
        description?: string;
    }): Promise<any>;
    private defaultSeverity;
}
