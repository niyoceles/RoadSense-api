import { CreateReportDto } from './dto/create-report.dto';
import { RoadReportsService } from './road-reports.service';
export declare class RoadReportsController {
    private readonly reportsService;
    constructor(reportsService: RoadReportsService);
    create(createReportDto: CreateReportDto): Promise<any>;
    findAll(includeInactive?: string): Promise<any>;
    findNearby(lat: number, lng: number, radius: number, limit?: number): Promise<any>;
    findNearRoute(body: {
        route: Array<{
            lat: number;
            lng: number;
        }>;
        corridorMeters?: number;
        limit?: number;
    }): Promise<any>;
    confirm(id: string, body: {
        userId?: string;
        sessionId?: string;
    }): Promise<any>;
    dismissPost(id: string, body: {
        userId?: string;
        sessionId?: string;
    }): Promise<any>;
    verify(id: string): Promise<any>;
    dismiss(id: string): Promise<any>;
    reject(id: string, body: {
        reason?: string;
    }): Promise<any>;
    expire(id: string): Promise<any>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
}
