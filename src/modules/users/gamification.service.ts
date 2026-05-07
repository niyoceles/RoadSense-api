import { Injectable } from '@nestjs/common';

export enum ActionType {
  REPORT_HAZARD = 'report_hazard',
  REPORT_CAMERA = 'report_camera',
  VERIFY_REPORT = 'verify_report',
  DRIVE_KM = 'drive_km', // Passive points
}

@Injectable()
export class GamificationService {
  private readonly POINTS_MAP = {
    [ActionType.REPORT_HAZARD]: 10,
    [ActionType.REPORT_CAMERA]: 15, // Cameras are high-value intel
    [ActionType.VERIFY_REPORT]: 5,
    [ActionType.DRIVE_KM]: 1,
  };

  /**
   * Awards points to a user and calculates their new level/rank.
   */
  awardPoints(userId: string, action: ActionType): { pointsGained: number, totalPoints: number, newRank: string } {
    const pointsGained = this.POINTS_MAP[action] || 0;
    
    // Mock DB fetch for current total
    let currentTotal = 450; 
    currentTotal += pointsGained;

    return {
      pointsGained,
      totalPoints: currentTotal,
      newRank: this.calculateRank(currentTotal)
    };
  }

  /**
   * Waze uses ranks like "Baby Wazer", "Wazer", "Knight". 
   * We will use a similar progression logic.
   */
  private calculateRank(totalPoints: number): string {
    if (totalPoints < 100) return 'Rookie Driver';
    if (totalPoints < 500) return 'Road Scout';
    if (totalPoints < 2000) return 'Nav Knight';
    return 'RoadSense Royalty';
  }
}
