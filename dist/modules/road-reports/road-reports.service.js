"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoadReportsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const create_report_dto_1 = require("./dto/create-report.dto");
const events_gateway_1 = require("../real-time-events/events.gateway");
const database_service_1 = require("../database/database.service");
let RoadReportsService = class RoadReportsService {
    constructor(gateway, database) {
        this.gateway = gateway;
        this.database = database;
        this.reports = [];
        this.confirmations = [];
        this.storagePath = (0, path_1.join)(process.cwd(), 'data', 'reports.json');
        this.confirmationsPath = (0, path_1.join)(process.cwd(), 'data', 'report-confirmations.json');
        this.ready = this.loadReports();
    }
    async create(createReportDto) {
        await this.ready;
        const now = new Date();
        const newReport = {
            id: Math.random().toString(36).substring(7),
            ...createReportDto,
            title: this.titleForType(createReportDto.type),
            source: createReportDto.source || 'user',
            status: this.initialStatusFor(createReportDto.type),
            confidenceScore: 0,
            createdAt: now,
            updatedAt: now,
            expiresAt: this.defaultExpiryFor(createReportDto.type, now),
            isVerified: false,
            verificationCount: 0,
            dismissalCount: 0,
            duplicateCount: await this.countNearbyDuplicates(createReportDto),
        };
        this.enrichCameraReport(newReport);
        this.recalculateConfidence(newReport);
        if (this.database.isEnabled) {
            const savedReport = await this.createInDatabase(newReport);
            this.gateway.broadcastIncidentCreated(savedReport);
            return savedReport;
        }
        this.reports.push(newReport);
        await this.saveReports();
        this.gateway.broadcastIncidentCreated(this.toPublicReport(newReport));
        return this.toPublicReport(newReport);
    }
    async findAll(includeInactive = false) {
        await this.ready;
        if (this.database.isEnabled) {
            if (!includeInactive)
                await this.expireStaleDatabaseReports();
            return this.findAllInDatabase(includeInactive);
        }
        if (!includeInactive)
            await this.expireStaleReports();
        return (includeInactive ? this.reports : this.visibleReports())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((report) => this.toPublicReport(report));
    }
    async findNearby(lat, lng, radius = 5000, limit = 100) {
        await this.ready;
        if (this.database.isEnabled) {
            await this.expireStaleDatabaseReports();
            return this.findNearbyInDatabase(lat, lng, radius, limit);
        }
        await this.expireStaleReports();
        const safeRadius = this.clamp(Number(radius) || 5000, 100, 25000);
        const safeLimit = this.clamp(Number(limit) || 100, 1, 250);
        return this.visibleReports()
            .map((report) => ({
            report,
            distanceMeters: this.distanceMeters(lat, lng, report.latitude, report.longitude),
        }))
            .filter((item) => item.distanceMeters <= safeRadius)
            .sort((a, b) => a.distanceMeters - b.distanceMeters)
            .slice(0, safeLimit)
            .map((item) => this.toPublicReport(item.report, item.distanceMeters));
    }
    async findNearRoute(route, corridorMeters = 120, limit = 100) {
        await this.ready;
        if (this.database.isEnabled) {
            await this.expireStaleDatabaseReports();
            return this.findNearRouteInDatabase(route, corridorMeters, limit);
        }
        await this.expireStaleReports();
        const points = route
            .map((point) => ({
            lat: Number(point.lat),
            lng: Number(point.lng),
        }))
            .filter((point) => Number.isFinite(point.lat) &&
            Number.isFinite(point.lng) &&
            Math.abs(point.lat) <= 90 &&
            Math.abs(point.lng) <= 180);
        if (points.length < 2)
            return [];
        const safeCorridor = this.clamp(Number(corridorMeters) || 120, 20, 1000);
        const safeLimit = this.clamp(Number(limit) || 100, 1, 250);
        return this.visibleReports()
            .map((report) => ({
            report,
            routeDistanceMeters: this.distanceToPolyline(report, points),
        }))
            .filter((item) => item.routeDistanceMeters <= safeCorridor)
            .sort((a, b) => a.routeDistanceMeters - b.routeDistanceMeters)
            .slice(0, safeLimit)
            .map((item) => this.toPublicReport(item.report, item.routeDistanceMeters));
    }
    async findNearbyByTypes(lat, lng, radius, types) {
        const nearby = await this.findNearby(lat, lng, radius);
        return nearby.filter((report) => types.includes(report.type));
    }
    async confirm(id, actor) {
        return this.recordConfirmation(id, 'confirm', actor);
    }
    async dismiss(id, actor) {
        return this.recordConfirmation(id, 'dismiss', actor);
    }
    async verify(id) {
        await this.ready;
        if (this.database.isEnabled) {
            const report = await this.findByIdInDatabase(id);
            if (!report)
                return null;
            report.isVerified = true;
            report.status = 'verified';
            report.verificationCount = (report.verificationCount || 0) + 1;
            report.verifiedAt = new Date();
            report.updatedAt = new Date();
            report.expiresAt = this.isLongLivedVerifiedType(report.type)
                ? null
                : this.extendExpiry(report, 2);
            this.recalculateConfidence(report);
            const saved = await this.updateDatabaseReport(report);
            this.gateway.broadcastIncidentUpdated(saved);
            return saved;
        }
        const report = this.reports.find((item) => item.id === id);
        if (!report)
            return null;
        report.isVerified = true;
        report.status = 'verified';
        report.verificationCount = (report.verificationCount || 0) + 1;
        report.verifiedAt = new Date();
        report.updatedAt = new Date();
        if (this.isLongLivedVerifiedType(report.type)) {
            report.expiresAt = null;
        }
        else {
            report.expiresAt = this.extendExpiry(report, 2);
        }
        this.recalculateConfidence(report);
        await this.saveReports();
        this.gateway.broadcastIncidentUpdated(this.toPublicReport(report));
        return this.toPublicReport(report);
    }
    async reject(id, reason) {
        await this.ready;
        if (this.database.isEnabled) {
            const report = await this.findByIdInDatabase(id);
            if (!report)
                return null;
            report.status = 'rejected';
            report.rejectedAt = new Date();
            report.rejectionReason = reason || 'Rejected by moderator';
            report.updatedAt = new Date();
            this.recalculateConfidence(report);
            const saved = await this.updateDatabaseReport(report);
            this.gateway.broadcastIncidentUpdated(saved);
            return saved;
        }
        const report = this.reports.find((item) => item.id === id);
        if (!report)
            return null;
        report.status = 'rejected';
        report.rejectedAt = new Date();
        report.rejectionReason = reason || 'Rejected by moderator';
        report.updatedAt = new Date();
        this.recalculateConfidence(report);
        await this.saveReports();
        this.gateway.broadcastIncidentUpdated(this.toPublicReport(report));
        return this.toPublicReport(report);
    }
    async expire(id) {
        await this.ready;
        if (this.database.isEnabled) {
            const report = await this.findByIdInDatabase(id);
            if (!report)
                return null;
            report.status = 'expired';
            report.expiresAt = new Date();
            report.updatedAt = new Date();
            const saved = await this.updateDatabaseReport(report);
            this.gateway.broadcastIncidentExpired(saved);
            return saved;
        }
        const report = this.reports.find((item) => item.id === id);
        if (!report)
            return null;
        report.status = 'expired';
        report.expiresAt = new Date();
        report.updatedAt = new Date();
        await this.saveReports();
        this.gateway.broadcastIncidentExpired(this.toPublicReport(report));
        return this.toPublicReport(report);
    }
    async delete(id) {
        await this.ready;
        if (this.database.isEnabled) {
            const result = await this.database.query('DELETE FROM incident_reports WHERE id = $1', [id]);
            return { deleted: result.rowCount > 0 };
        }
        const before = this.reports.length;
        this.reports = this.reports.filter((item) => item.id !== id);
        if (this.reports.length !== before) {
            await this.saveReports();
        }
        return { deleted: this.reports.length !== before };
    }
    async recordConfirmation(id, action, actor) {
        await this.ready;
        if (this.database.isEnabled) {
            const report = await this.findByIdInDatabase(id);
            if (!report)
                return null;
            await this.database.query(`INSERT INTO incident_confirmations (
          incident_report_id,
          user_id,
          anonymized_device_session_id,
          action
        ) VALUES ($1, $2, $3, $4)`, [id, actor?.userId || null, actor?.sessionId || 'anonymous', action]);
            if (action === 'confirm' || action === 'still_there') {
                report.verificationCount = (report.verificationCount || 0) + 1;
                if (report.status === 'pending')
                    report.status = 'active';
                report.expiresAt = this.extendExpiry(report, 1.35);
            }
            else {
                report.dismissalCount = (report.dismissalCount || 0) + 1;
            }
            report.updatedAt = new Date();
            this.recalculateConfidence(report);
            const saved = await this.updateDatabaseReport(report);
            this.gateway.broadcastIncidentUpdated(saved);
            return saved;
        }
        const report = this.reports.find((item) => item.id === id);
        if (!report)
            return null;
        this.confirmations.push({
            id: Math.random().toString(36).substring(7),
            incidentReportId: id,
            action,
            userId: actor?.userId,
            anonymizedDeviceSessionId: actor?.sessionId,
            createdAt: new Date(),
        });
        if (action === 'confirm' || action === 'still_there') {
            report.verificationCount = (report.verificationCount || 0) + 1;
            if (report.status === 'pending')
                report.status = 'active';
            report.expiresAt = this.extendExpiry(report, 1.35);
        }
        else {
            report.dismissalCount = (report.dismissalCount || 0) + 1;
        }
        report.updatedAt = new Date();
        this.recalculateConfidence(report);
        await this.saveReports();
        this.gateway.broadcastIncidentUpdated(this.toPublicReport(report));
        return this.toPublicReport(report);
    }
    async loadReports() {
        if (this.database.isEnabled) {
            return;
        }
        try {
            const raw = await fs_1.promises.readFile(this.storagePath, 'utf8');
            this.reports = JSON.parse(raw);
        }
        catch (error) {
            this.reports = [];
            await this.saveReports();
        }
        try {
            const rawConfirmations = await fs_1.promises.readFile(this.confirmationsPath, 'utf8');
            this.confirmations = JSON.parse(rawConfirmations);
        }
        catch (error) {
            this.confirmations = [];
            await this.saveReports();
        }
    }
    async saveReports() {
        await fs_1.promises.mkdir((0, path_1.join)(process.cwd(), 'data'), { recursive: true });
        await fs_1.promises.writeFile(this.storagePath, JSON.stringify(this.reports, null, 2), 'utf8');
        await fs_1.promises.writeFile(this.confirmationsPath, JSON.stringify(this.confirmations, null, 2), 'utf8');
    }
    async expireStaleReports() {
        const now = Date.now();
        let changed = false;
        for (const report of this.reports) {
            if (report.status !== 'expired' &&
                report.status !== 'verified' &&
                report.expiresAt &&
                new Date(report.expiresAt).getTime() <= now) {
                report.status = 'expired';
                report.updatedAt = new Date();
                changed = true;
                this.gateway.broadcastIncidentExpired(this.toPublicReport(report));
            }
        }
        if (changed)
            await this.saveReports();
    }
    async expireStaleDatabaseReports() {
        const result = await this.database.query(`UPDATE incident_reports
       SET status = 'expired', updated_at = now()
       WHERE status NOT IN ('expired', 'verified', 'rejected')
         AND expires_at IS NOT NULL
         AND expires_at <= now()
       RETURNING *`);
        for (const row of result.rows) {
            this.gateway.broadcastIncidentExpired(this.databaseRowToReport(row));
        }
    }
    visibleReports() {
        return this.reports.filter((report) => ['active', 'verified', 'pending'].includes(report.status || 'active'));
    }
    recalculateConfidence(report) {
        const confirmations = report.verificationCount || 0;
        const dismissals = report.dismissalCount || 0;
        const ageHours = (Date.now() - new Date(report.createdAt).getTime()) / (60 * 60 * 1000);
        const evidenceBoost = report.imageUrl || report.evidenceUrl ? 0.08 : 0;
        const adminBoost = report.status === 'verified' || report.isVerified ? 0.35 : 0;
        const duplicateBoost = Math.min((report.duplicateCount || 0) * 0.06, 0.18);
        const ageDecay = Math.min(ageHours * 0.025, 0.35);
        const score = 0.42 +
            confirmations * 0.12 -
            dismissals * 0.18 +
            evidenceBoost +
            adminBoost +
            duplicateBoost -
            ageDecay;
        report.confidenceScore = this.clamp(score, 0.05, 0.98);
        if (report.confidenceScore < 0.18 && report.status !== 'verified') {
            report.status = 'expired';
            report.expiresAt = new Date();
        }
    }
    defaultExpiryFor(type, createdAt) {
        const hours = {
            [create_report_dto_1.ReportType.TRAFFIC]: 1,
            [create_report_dto_1.ReportType.ACCIDENT]: 3,
            [create_report_dto_1.ReportType.CRASH]: 3,
            [create_report_dto_1.ReportType.CLOSURE]: 12,
            [create_report_dto_1.ReportType.FLOOD]: 8,
            [create_report_dto_1.ReportType.POTHOLE]: 24 * 14,
            [create_report_dto_1.ReportType.BAD_ROAD]: 24 * 14,
            [create_report_dto_1.ReportType.POLICE]: 2,
            [create_report_dto_1.ReportType.SPEED_CAMERA]: 2,
            [create_report_dto_1.ReportType.HAZARD]: 3,
        }[type];
        if (!hours)
            return null;
        return new Date(createdAt.getTime() + hours * 60 * 60 * 1000).toISOString();
    }
    extendExpiry(report, multiplier) {
        if (!report.expiresAt)
            return null;
        const current = new Date(report.expiresAt).getTime();
        const remaining = Math.max(current - Date.now(), 30 * 60 * 1000);
        return new Date(Date.now() + remaining * multiplier).toISOString();
    }
    initialStatusFor(type) {
        if ([create_report_dto_1.ReportType.POTHOLE, create_report_dto_1.ReportType.BAD_ROAD, create_report_dto_1.ReportType.SPEED_CAMERA].includes(type)) {
            return 'pending';
        }
        return 'active';
    }
    isLongLivedVerifiedType(type) {
        return [create_report_dto_1.ReportType.POTHOLE, create_report_dto_1.ReportType.BAD_ROAD, create_report_dto_1.ReportType.SPEED_CAMERA].includes(type);
    }
    async countNearbyDuplicates(createReportDto) {
        if (this.database.isEnabled) {
            const result = await this.database.query(`SELECT count(*)::int AS count
         FROM incident_reports
         WHERE type = $1
           AND status IN ('pending', 'active', 'verified')
           AND ST_DWithin(
             geom,
             ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
             80
           )`, [createReportDto.type, createReportDto.longitude, createReportDto.latitude]);
            return Number(result.rows[0]?.count || 0);
        }
        return this.reports.filter((report) => report.type === createReportDto.type &&
            this.distanceMeters(report.latitude, report.longitude, createReportDto.latitude, createReportDto.longitude) < 80).length;
    }
    async createInDatabase(report) {
        const result = await this.database.query(`INSERT INTO incident_reports (
        type,
        title,
        description,
        latitude,
        longitude,
        severity,
        confidence_score,
        status,
        source,
        reported_by_user_id,
        evidence_url,
        created_at,
        updated_at,
        expires_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *`, [
            report.type,
            report.title,
            report.description || null,
            report.latitude,
            report.longitude,
            report.severity,
            report.confidenceScore,
            report.status,
            report.source || 'user',
            report.reportedBy || null,
            report.evidenceUrl || report.imageUrl || null,
            report.createdAt,
            report.updatedAt,
            report.expiresAt,
        ]);
        return this.toPublicReport({
            ...this.databaseRowToReport(result.rows[0]),
            duplicateCount: report.duplicateCount || 0,
        });
    }
    async findAllInDatabase(includeInactive = false) {
        const result = await this.database.query(`${this.reportSelectSql()}
       WHERE (
         $1::boolean = true
         OR (
           r.status IN ('pending', 'active', 'verified')
           AND (r.expires_at IS NULL OR r.expires_at > now())
         )
       )
       ORDER BY r.created_at DESC
       LIMIT 250`, [includeInactive]);
        return result.rows.map((row) => this.toPublicReport(this.databaseRowToReport(row)));
    }
    async findNearbyInDatabase(lat, lng, radius = 5000, limit = 100) {
        const safeRadius = this.clamp(Number(radius) || 5000, 100, 25000);
        const safeLimit = this.clamp(Number(limit) || 100, 1, 250);
        const result = await this.database.query(`${this.reportSelectSql(`
        ST_Distance(
          r.geom,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) AS distance_meters
      `)}
       WHERE r.status IN ('pending', 'active', 'verified')
         AND (r.expires_at IS NULL OR r.expires_at > now())
         AND ST_DWithin(
           r.geom,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )
       ORDER BY distance_meters ASC
       LIMIT $4`, [lng, lat, safeRadius, safeLimit]);
        return result.rows.map((row) => this.toPublicReport(this.databaseRowToReport(row), Number(row.distance_meters)));
    }
    async findNearRouteInDatabase(route, corridorMeters = 120, limit = 100) {
        const points = this.sanitizedRoute(route);
        if (points.length < 2)
            return [];
        const safeCorridor = this.clamp(Number(corridorMeters) || 120, 20, 1000);
        const safeLimit = this.clamp(Number(limit) || 100, 1, 250);
        const line = {
            type: 'LineString',
            coordinates: points.map((point) => [point.lng, point.lat]),
        };
        const result = await this.database.query(`WITH route_line AS (
         SELECT ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) AS geom
       )
       ${this.reportSelectSql(`
        ST_Distance(
          r.geom,
          (SELECT geom::geography FROM route_line)
        ) AS distance_meters
       `)}
       WHERE r.status IN ('pending', 'active', 'verified')
         AND (r.expires_at IS NULL OR r.expires_at > now())
         AND ST_DWithin(r.geom, (SELECT geom::geography FROM route_line), $2)
       ORDER BY distance_meters ASC
       LIMIT $3`, [JSON.stringify(line), safeCorridor, safeLimit]);
        return result.rows.map((row) => this.toPublicReport(this.databaseRowToReport(row), Number(row.distance_meters)));
    }
    async findByIdInDatabase(id) {
        const result = await this.database.query(`${this.reportSelectSql()}
       WHERE r.id = $1
       LIMIT 1`, [id]);
        return result.rows[0] ? this.databaseRowToReport(result.rows[0]) : null;
    }
    async updateDatabaseReport(report) {
        const result = await this.database.query(`UPDATE incident_reports
       SET status = $2,
           confidence_score = $3,
           expires_at = $4,
           verified_at = $5,
           rejected_at = $6,
           rejection_reason = $7,
           updated_at = now()
       WHERE id = $1
       RETURNING *`, [
            report.id,
            report.status,
            report.confidenceScore,
            report.expiresAt,
            report.verifiedAt || null,
            report.rejectedAt || null,
            report.rejectionReason || null,
        ]);
        const saved = this.databaseRowToReport({
            ...result.rows[0],
            confirmation_count: report.verificationCount || 0,
            dismissal_count: report.dismissalCount || 0,
        });
        return this.toPublicReport(saved);
    }
    reportSelectSql(extraSelect = '') {
        return `SELECT
      r.*,
      COALESCE(confirmations.confirmation_count, 0)::int AS confirmation_count,
      COALESCE(dismissals.dismissal_count, 0)::int AS dismissal_count
      ${extraSelect ? `, ${extraSelect}` : ''}
     FROM incident_reports r
     LEFT JOIN (
       SELECT incident_report_id, count(*) AS confirmation_count
       FROM incident_confirmations
       WHERE action IN ('confirm', 'still_there')
       GROUP BY incident_report_id
     ) confirmations ON confirmations.incident_report_id = r.id
     LEFT JOIN (
       SELECT incident_report_id, count(*) AS dismissal_count
       FROM incident_confirmations
       WHERE action IN ('dismiss', 'not_there')
       GROUP BY incident_report_id
     ) dismissals ON dismissals.incident_report_id = r.id`;
    }
    databaseRowToReport(row) {
        return {
            id: row.id,
            type: row.type,
            title: row.title || this.titleForType(row.type),
            description: row.description || '',
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            severity: row.severity,
            confidenceScore: Number(row.confidence_score ?? 0.45),
            status: row.status,
            source: row.source,
            reportedBy: row.reported_by_user_id,
            evidenceUrl: row.evidence_url,
            imageUrl: row.evidence_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            expiresAt: row.expires_at,
            verifiedAt: row.verified_at,
            rejectedAt: row.rejected_at,
            rejectionReason: row.rejection_reason,
            isVerified: row.status === 'verified',
            verificationCount: Number(row.confirmation_count || 0),
            dismissalCount: Number(row.dismissal_count || 0),
        };
    }
    sanitizedRoute(route) {
        return route
            .map((point) => ({
            lat: Number(point.lat),
            lng: Number(point.lng),
        }))
            .filter((point) => Number.isFinite(point.lat) &&
            Number.isFinite(point.lng) &&
            Math.abs(point.lat) <= 90 &&
            Math.abs(point.lng) <= 180);
    }
    toPublicReport(report, distanceMeters) {
        return {
            ...report,
            distanceMeters: distanceMeters === undefined ? undefined : Math.round(distanceMeters),
            confirmationCount: report.verificationCount || 0,
            dismissalCount: report.dismissalCount || 0,
        };
    }
    titleForType(type) {
        return type.replace(/_/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
    }
    enrichCameraReport(report) {
        if (report.type !== create_report_dto_1.ReportType.SPEED_CAMERA)
            return;
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
    }
    extractSpeedLimit(description) {
        const match = description?.match(/(\d{2,3})\s?(km\/h|kph|kmh)/i);
        if (!match)
            return null;
        return Number(match[1]);
    }
    normalizeDegrees(value) {
        return ((Math.round(value) % 360) + 360) % 360;
    }
    segmentIdForLocation(lat, lng) {
        const gridLat = Math.round(lat * 1000) / 1000;
        const gridLng = Math.round(lng * 1000) / 1000;
        return `${gridLat},${gridLng}`;
    }
    distanceToPolyline(report, route) {
        let minDistance = Number.POSITIVE_INFINITY;
        for (let index = 0; index < route.length - 1; index++) {
            minDistance = Math.min(minDistance, this.distanceToSegment({ lat: report.latitude, lng: report.longitude }, route[index], route[index + 1]));
        }
        return minDistance;
    }
    distanceToSegment(point, start, end) {
        const latScale = 111320;
        const lngScale = latScale * Math.cos((point.lat * Math.PI) / 180);
        const sx = (start.lng - point.lng) * lngScale;
        const sy = (start.lat - point.lat) * latScale;
        const ex = (end.lng - point.lng) * lngScale;
        const ey = (end.lat - point.lat) * latScale;
        const dx = ex - sx;
        const dy = ey - sy;
        const lengthSq = dx * dx + dy * dy;
        const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, (-sx * dx - sy * dy) / lengthSq));
        const projected = {
            lat: point.lat + (sy + dy * t) / latScale,
            lng: point.lng + (sx + dx * t) / lngScale,
        };
        return this.distanceMeters(point.lat, point.lng, projected.lat, projected.lng);
    }
    distanceMeters(lat1, lng1, lat2, lng2) {
        const earthRadiusM = 6371000;
        const toRad = (degrees) => (degrees * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        return 2 * earthRadiusM * Math.asin(Math.sqrt(a));
    }
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};
exports.RoadReportsService = RoadReportsService;
exports.RoadReportsService = RoadReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_gateway_1.RealTimeEventGateway,
        database_service_1.DatabaseService])
], RoadReportsService);
//# sourceMappingURL=road-reports.service.js.map