import { ReportType } from '../../modules/road-reports/dto/create-report.dto';
export declare class HazardReportIntentDto {
    hazardType: ReportType;
    lat: number;
    lng: number;
    description?: string;
    confidence?: number;
}
