import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DatabaseService } from '../database/database.service';

export enum TrafficLevel {
  FLUID = 'fluid', // Green
  MODERATE = 'moderate', // Orange
  CONGESTED = 'congested', // Red
  BLOCKED = 'blocked', // Dark Red
}

@Injectable()
export class TrafficEngineService {
  private readonly storagePath = join(process.cwd(), 'data', 'traffic.json');
  private readonly ready: Promise<void>;
  private segments = new Map<string, any>();

  constructor(private readonly database: DatabaseService) {
    this.ready = this.loadSegments();
  }

  /**
   * Determines traffic level based on speed relative to the road's speed limit
   */
  calculateTrafficLevel(currentSpeed: number, speedLimit: number): TrafficLevel {
    const ratio = currentSpeed / speedLimit;

    if (ratio >= 0.8) return TrafficLevel.FLUID;
    if (ratio >= 0.5) return TrafficLevel.MODERATE;
    if (ratio >= 0.2) return TrafficLevel.CONGESTED;
    return TrafficLevel.BLOCKED;
  }

  /**
   * Blends historical traffic data with real-time reports
   */
  getDynamicRouteWeight(segmentId: string, baseWeight: number): number {
    const segment = this.segments.get(segmentId);
    const trafficMultiplier = this.multiplierForLevel(segment?.trafficLevel);
    return baseWeight * trafficMultiplier;
  }

  async recordTrafficUpdate(update: {
    lat: number;
    lng: number;
    speedKmh: number;
    heading?: number;
    speedLimit?: number;
    accuracyMeters?: number;
    vehicleType?: string;
    sessionId?: string;
  }) {
    await this.ready;

    const rejectionReason = this.validateSample(update);
    if (rejectionReason) {
      return { accepted: false, rejectionReason };
    }

    if (this.database.isEnabled) {
      return this.recordTrafficUpdateInDatabase(update);
    }

    const match = this.matchRoadSegment(update.lat, update.lng, update.heading);
    if (!match) {
      return { accepted: false, rejectionReason: 'no_road_segment_match' };
    }

    const segmentId = match.segmentId;
    const existing = this.segments.get(segmentId);
    const sampleCount = existing?.sampleCount || 0;
    const avgSpeedKmh = existing
      ? (existing.avgSpeedKmh * sampleCount + update.speedKmh) /
        (sampleCount + 1)
      : update.speedKmh;
    const speedLimit = update.speedLimit || existing?.speedLimit || 60;
    const trafficLevel = this.classifyWithConfidence(
      avgSpeedKmh,
      speedLimit,
      sampleCount + 1,
    );
    const segment = {
      segmentId,
      centerLat: match.centerLat,
      centerLng: match.centerLng,
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      speedLimit,
      trafficLevel,
      confidenceScore: this.confidenceForSegment(sampleCount + 1, existing?.updatedAt),
      sampleCount: sampleCount + 1,
      lastHeading: update.heading,
      vehicleType: update.vehicleType,
      anonymizedSessionId: update.sessionId,
      updatedAt: new Date(),
    };

    this.segments.set(segmentId, segment);
    await this.saveSegments();
    return segment;
  }

  async findNearby(lat: number, lng: number, radiusMeters = 5000) {
    await this.ready;
    if (this.database.isEnabled) {
      return this.findNearbyInDatabase(lat, lng, radiusMeters);
    }

    const safeRadius = this.clamp(Number(radiusMeters) || 5000, 100, 25000);
    return [...this.segments.values()]
      .filter((segment) => {
        const distance = this.distanceMeters(
          lat,
          lng,
          segment.centerLat,
          segment.centerLng,
        );
        return distance <= safeRadius;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }

  async findNearRoute(
    route: Array<{ lat: number; lng: number }>,
    corridorMeters = 120,
  ) {
    await this.ready;
    if (this.database.isEnabled) {
      return this.findNearRouteInDatabase(route, corridorMeters);
    }

    const points = route
      .map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) }))
      .filter(
        (point) =>
          Number.isFinite(point.lat) &&
          Number.isFinite(point.lng) &&
          Math.abs(point.lat) <= 90 &&
          Math.abs(point.lng) <= 180,
      );
    if (points.length < 2) return [];

    const safeCorridor = this.clamp(Number(corridorMeters) || 120, 20, 1000);
    return [...this.segments.values()]
      .map((segment) => ({
        segment,
        distanceMeters: this.distanceToPolyline(
          { lat: segment.centerLat, lng: segment.centerLng },
          points,
        ),
      }))
      .filter((item) => item.distanceMeters <= safeCorridor)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .map((item) => item.segment);
  }

  getTrafficLevelAt(lat: number, lng: number): TrafficLevel {
    const segmentId = this.segmentIdForLocation(lat, lng);
    const segment = this.segments.get(segmentId);
    return segment?.trafficLevel || TrafficLevel.FLUID;
  }

  segmentIdForLocation(lat: number, lng: number): string {
    return `${this.roundToGrid(lat)},${this.roundToGrid(lng)}`;
  }

  private roundToGrid(value: number): number {
    return Math.round(value * 500) / 500;
  }

  private validateSample(update: {
    lat: number;
    lng: number;
    speedKmh: number;
    accuracyMeters?: number;
  }): string | null {
    if (!Number.isFinite(update.lat) || Math.abs(update.lat) > 90) return 'invalid_latitude';
    if (!Number.isFinite(update.lng) || Math.abs(update.lng) > 180) return 'invalid_longitude';
    if (!Number.isFinite(update.speedKmh) || update.speedKmh < 0 || update.speedKmh > 220) {
      return 'unrealistic_speed';
    }
    if (update.accuracyMeters !== undefined && update.accuracyMeters > 75) {
      return 'poor_gps_accuracy';
    }
    return null;
  }

  private matchRoadSegment(lat: number, lng: number, heading?: number) {
    // Transitional matcher until OSM road geometries are loaded into PostGIS.
    // It uses a finer segment grid plus heading bucket so samples from opposite
    // directions do not immediately poison each other.
    const headingBucket =
      typeof heading === 'number' ? Math.round(this.normalizeDegrees(heading) / 45) * 45 : 'unknown';
    return {
      segmentId: `${this.roundToRoadGrid(lat)},${this.roundToRoadGrid(lng)},${headingBucket}`,
      centerLat: this.roundToRoadGrid(lat),
      centerLng: this.roundToRoadGrid(lng),
    };
  }

  private async recordTrafficUpdateInDatabase(update: {
    lat: number;
    lng: number;
    speedKmh: number;
    heading?: number;
    speedLimit?: number;
    accuracyMeters?: number;
    vehicleType?: string;
    sessionId?: string;
  }) {
    const match = await this.matchRoadSegmentInDatabase(
      update.lat,
      update.lng,
      update.heading,
    );
    const sessionId = update.sessionId || 'anonymous';

    await this.database.query(
      `INSERT INTO speed_samples (
        anonymized_device_session_id,
        latitude,
        longitude,
        speed_kph,
        heading,
        vehicle_type,
        accuracy_meters,
        matched_road_segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        sessionId,
        update.lat,
        update.lng,
        update.speedKmh,
        update.heading ?? null,
        update.vehicleType || null,
        update.accuracyMeters ?? null,
        match?.internal_segment_id || null,
      ],
    );

    if (!match) {
      return { accepted: false, rejectionReason: 'no_road_segment_match' };
    }

    const sampleCount = Number(match.sample_count || 0);
    const speedLimit = Number(update.speedLimit || match.expected_speed_kph || 60);
    const avgSpeedKmh =
      (Number(match.average_speed_kph || speedLimit) * sampleCount +
        update.speedKmh) /
      (sampleCount + 1);
    const trafficLevel = this.classifyWithConfidence(
      avgSpeedKmh,
      speedLimit,
      sampleCount + 1,
    );
    const confidenceScore = this.confidenceForSegment(
      sampleCount + 1,
      match.last_updated_at,
    );

    const result = await this.database.query(
      `UPDATE road_segment_traffic
       SET average_speed_kph = $2,
           expected_speed_kph = $3,
           traffic_level = $4,
           confidence_score = $5,
           sample_count = sample_count + 1,
           last_updated_at = now()
       WHERE internal_segment_id = $1
       RETURNING
         *,
         ST_Y(ST_Centroid(geom)) AS center_lat,
         ST_X(ST_Centroid(geom)) AS center_lng`,
      [
        match.internal_segment_id,
        Math.round(avgSpeedKmh * 10) / 10,
        speedLimit,
        trafficLevel,
        confidenceScore,
      ],
    );

    return this.databaseSegmentToPublic(result.rows[0], true);
  }

  private async matchRoadSegmentInDatabase(
    lat: number,
    lng: number,
    heading?: number,
  ) {
    const pointSql = 'ST_SetSRID(ST_MakePoint($1, $2), 4326)';
    const result = await this.database.query(
      `SELECT
         *,
         ST_Distance(geom::geography, ${pointSql}::geography) AS distance_meters,
         CASE
           WHEN $3::numeric IS NULL THEN 0
           ELSE abs(
             degrees(ST_Azimuth(
               ST_StartPoint(ST_GeometryN(geom, 1)),
               ST_EndPoint(ST_GeometryN(geom, 1))
             )) - $3::numeric
           )
         END AS heading_delta
       FROM road_segment_traffic
       WHERE geom IS NOT NULL
         AND ST_DWithin(geom::geography, ${pointSql}::geography, $4)
       ORDER BY distance_meters ASC, heading_delta ASC
       LIMIT 1`,
      [lng, lat, heading ?? null, 35],
    );

    return result.rows[0] || null;
  }

  private async findNearbyInDatabase(
    lat: number,
    lng: number,
    radiusMeters = 5000,
  ) {
    const safeRadius = this.clamp(Number(radiusMeters) || 5000, 100, 25000);
    const result = await this.database.query(
      `SELECT
         *,
         ST_Y(ST_Centroid(geom)) AS center_lat,
         ST_X(ST_Centroid(geom)) AS center_lng,
         ST_Distance(
           geom::geography,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
         ) AS distance_meters
       FROM road_segment_traffic
       WHERE geom IS NOT NULL
         AND sample_count > 0
         AND ST_DWithin(
           geom::geography,
           ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
           $3
         )
       ORDER BY last_updated_at DESC
       LIMIT 300`,
      [lng, lat, safeRadius],
    );
    return result.rows.map((row) => this.databaseSegmentToPublic(row));
  }

  private async findNearRouteInDatabase(
    route: Array<{ lat: number; lng: number }>,
    corridorMeters = 120,
  ) {
    const points = route
      .map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) }))
      .filter(
        (point) =>
          Number.isFinite(point.lat) &&
          Number.isFinite(point.lng) &&
          Math.abs(point.lat) <= 90 &&
          Math.abs(point.lng) <= 180,
      );
    if (points.length < 2) return [];

    const safeCorridor = this.clamp(Number(corridorMeters) || 120, 20, 1000);
    const line = {
      type: 'LineString',
      coordinates: points.map((point) => [point.lng, point.lat]),
    };
    const result = await this.database.query(
      `WITH route_line AS (
         SELECT ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) AS geom
       )
       SELECT
         rst.*,
         ST_Y(ST_Centroid(rst.geom)) AS center_lat,
         ST_X(ST_Centroid(rst.geom)) AS center_lng,
         ST_Distance(
           rst.geom::geography,
           (SELECT geom::geography FROM route_line)
         ) AS distance_meters
       FROM road_segment_traffic rst
       WHERE rst.geom IS NOT NULL
         AND rst.sample_count > 0
         AND ST_DWithin(
           rst.geom::geography,
           (SELECT geom::geography FROM route_line),
           $2
         )
       ORDER BY distance_meters ASC
       LIMIT 300`,
      [JSON.stringify(line), safeCorridor],
    );
    return result.rows.map((row) => this.databaseSegmentToPublic(row));
  }

  private databaseSegmentToPublic(row: any, accepted = true) {
    return {
      accepted,
      segmentId: row.internal_segment_id,
      internalSegmentId: row.internal_segment_id,
      osmWayId: row.osm_way_id,
      roadName: row.road_name,
      centerLat: Number(row.center_lat),
      centerLng: Number(row.center_lng),
      avgSpeedKmh: Number(row.average_speed_kph),
      speedLimit: Number(row.expected_speed_kph),
      trafficLevel: row.traffic_level,
      confidenceScore: Number(row.confidence_score),
      sampleCount: Number(row.sample_count),
      updatedAt: row.last_updated_at,
    };
  }

  private roundToRoadGrid(value: number): number {
    return Math.round(value * 2000) / 2000;
  }

  private normalizeDegrees(value: number): number {
    return ((Math.round(value) % 360) + 360) % 360;
  }

  private classifyWithConfidence(
    currentSpeed: number,
    speedLimit: number,
    sampleCount: number,
  ): TrafficLevel {
    const level = this.calculateTrafficLevel(currentSpeed, speedLimit);
    if (level === TrafficLevel.BLOCKED && sampleCount < 3) {
      return TrafficLevel.CONGESTED;
    }
    return level;
  }

  private confidenceForSegment(sampleCount: number, updatedAt?: string | Date): number {
    const sampleConfidence = Math.min(sampleCount / 8, 1) * 0.7;
    const ageMinutes = updatedAt
      ? (Date.now() - new Date(updatedAt).getTime()) / (60 * 1000)
      : 0;
    const recencyConfidence = Math.max(0, 0.3 - ageMinutes * 0.01);
    return this.clamp(sampleConfidence + recencyConfidence, 0.05, 0.95);
  }

  private multiplierForLevel(level?: TrafficLevel): number {
    switch (level) {
      case TrafficLevel.MODERATE:
        return 1.2;
      case TrafficLevel.CONGESTED:
        return 1.6;
      case TrafficLevel.BLOCKED:
        return 3.0;
      case TrafficLevel.FLUID:
      default:
        return 1.0;
    }
  }

  private async loadSegments() {
    try {
      const raw = await fs.readFile(this.storagePath, 'utf8');
      const saved = JSON.parse(raw);
      this.segments = new Map(
        saved.map((segment: any) => [segment.segmentId, segment]),
      );
    } catch (error) {
      this.segments = new Map();
      await this.saveSegments();
    }
  }

  private async saveSegments() {
    await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });
    await fs.writeFile(
      this.storagePath,
      JSON.stringify([...this.segments.values()], null, 2),
      'utf8',
    );
  }

  private distanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const earthRadiusM = 6371000;
    const toRad = (degrees: number) => (degrees * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return 2 * earthRadiusM * Math.asin(Math.sqrt(a));
  }

  private distanceToPolyline(
    point: { lat: number; lng: number },
    route: Array<{ lat: number; lng: number }>,
  ) {
    let minDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < route.length - 1; index++) {
      minDistance = Math.min(
        minDistance,
        this.distanceToSegment(point, route[index], route[index + 1]),
      );
    }
    return minDistance;
  }

  private distanceToSegment(
    point: { lat: number; lng: number },
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
  ) {
    const latScale = 111320;
    const lngScale = latScale * Math.cos((point.lat * Math.PI) / 180);
    const sx = (start.lng - point.lng) * lngScale;
    const sy = (start.lat - point.lat) * latScale;
    const ex = (end.lng - point.lng) * lngScale;
    const ey = (end.lat - point.lat) * latScale;
    const dx = ex - sx;
    const dy = ey - sy;
    const lengthSq = dx * dx + dy * dy;
    const t =
      lengthSq === 0
        ? 0
        : Math.max(0, Math.min(1, (-sx * dx - sy * dy) / lengthSq));
    const projected = {
      lat: point.lat + (sy + dy * t) / latScale,
      lng: point.lng + (sx + dx * t) / lngScale,
    };
    return this.distanceMeters(point.lat, point.lng, projected.lat, projected.lng);
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}
