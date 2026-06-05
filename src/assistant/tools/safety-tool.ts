import { Injectable } from '@nestjs/common';
import { HazardTool } from './hazard-tool';

@Injectable()
export class SafetyTool {
  constructor(private readonly hazardTool: HazardTool) {}

  async getSafetySummary(lat?: number, lng?: number, radiusMeters = 1500) {
    if (lat == null || lng == null) {
      return {
        hasLocation: false,
        summary:
          'I can give better safety guidance when location is available. Keep attention on the road and use voice if you are driving.',
      };
    }

    const hazards = await this.hazardTool.findNearbyHazards(lat, lng, radiusMeters);
    return {
      hasLocation: true,
      hazardCount: hazards.length,
      summary:
        hazards.length === 0
          ? 'No active nearby hazards found. Stay alert and avoid typing while driving.'
          : `${hazards.length} active hazard${hazards.length === 1 ? '' : 's'} nearby. Slow down and follow road signs.`,
    };
  }
}
