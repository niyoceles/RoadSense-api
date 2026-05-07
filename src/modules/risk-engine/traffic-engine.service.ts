import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

export enum TrafficLevel {
  FLUID = 'fluid',     // Green
  MODERATE = 'moderate', // Orange
  CONGESTED = 'congested', // Red
  BLOCKED = 'blocked',    // Dark Red
}

@Injectable()
export class TrafficEngineService {
  private readonly storagePath = join(process.cwd(), 'data', 'traffic.json');
  private readonly ready: Promise<void>;
  private segments = new Map<string, any>();

  constructor() {
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
  }) {
    await this.ready;

    const segmentId = this.segmentIdForLocation(update.lat, update.lng);
    const existing = this.segments.get(segmentId);
    const sampleCount = existing?.sampleCount || 0;
    const avgSpeedKmh = existing
      ? (existing.avgSpeedKmh * sampleCount + update.speedKmh) /
        (sampleCount + 1)
      : update.speedKmh;
    const speedLimit = update.speedLimit || existing?.speedLimit || 60;
    const trafficLevel = this.calculateTrafficLevel(avgSpeedKmh, speedLimit);
    const segment = {
      segmentId,
      centerLat: this.roundToGrid(update.lat),
      centerLng: this.roundToGrid(update.lng),
      avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
      speedLimit,
      trafficLevel,
      sampleCount: sampleCount + 1,
      lastHeading: update.heading,
      updatedAt: new Date(),
    };

    this.segments.set(segmentId, segment);
    await this.saveSegments();
    return segment;
  }

  async findNearby(lat: number, lng: number, radiusMeters = 5000) {
    await this.ready;
    return [...this.segments.values()]
      .filter((segment) => {
        const distance = this.distanceMeters(
          lat,
          lng,
          segment.centerLat,
          segment.centerLng,
        );
        return distance <= radiusMeters;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
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
}
