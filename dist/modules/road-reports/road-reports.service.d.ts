import { CreateReportDto, ReportType } from './dto/create-report.dto';
import { RealTimeEventGateway } from '../real-time-events/events.gateway';
import { DatabaseService } from '../database/database.service';
interface RoutePoint {
    lat: number;
    lng: number;
}
export declare class RoadReportsService {
    private readonly gateway;
    private readonly database;
    private reports;
    private confirmations;
    private readonly storagePath;
    private readonly confirmationsPath;
    private readonly ready;
    constructor(gateway: RealTimeEventGateway, database: DatabaseService);
    create(createReportDto: CreateReportDto): Promise<any>;
    findAll(includeInactive?: boolean): Promise<any[]>;
    findNearby(lat: number, lng: number, radius?: number, limit?: number): Promise<any[]>;
    findNearRoute(route: RoutePoint[], corridorMeters?: number, limit?: number): Promise<any[]>;
    findNearbyByTypes(lat: number, lng: number, radius: number, types: ReportType[]): Promise<any[]>;
    confirm(id: string, actor: {
        userId?: string;
        sessionId?: string;
    }): Promise<any>;
    dismiss(id: string, actor: {
        userId?: string;
        sessionId?: string;
    }): Promise<any>;
    verify(id: string): Promise<any>;
    reject(id: string, reason?: string): Promise<any>;
    expire(id: string): Promise<any>;
    delete(id: string): Promise<{
        deleted: boolean;
    }>;
    private recordConfirmation;
    private loadReports;
    private saveReports;
    private expireStaleReports;
    private expireStaleDatabaseReports;
    private visibleReports;
    private recalculateConfidence;
    private defaultExpiryFor;
    private extendExpiry;
    private initialStatusFor;
    private isLongLivedVerifiedType;
    private countNearbyDuplicates;
    private createInDatabase;
    private findAllInDatabase;
    private findNearbyInDatabase;
    private findNearRouteInDatabase;
    private findByIdInDatabase;
    private updateDatabaseReport;
    private reportSelectSql;
    private databaseRowToReport;
    private sanitizedRoute;
    private toPublicReport;
    private titleForType;
    private enrichCameraReport;
    private extractSpeedLimit;
    private normalizeDegrees;
    private segmentIdForLocation;
    private distanceToPolyline;
    private distanceToSegment;
    private distanceMeters;
    private clamp;
}
export {};
