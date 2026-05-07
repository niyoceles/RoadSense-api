import { Injectable } from '@nestjs/common';

@Injectable()
export class ReputationService {
  /**
   * Calculates a confidence score for a report (0.0 to 1.0)
   * @param userScore The reputation score of the reporter (0-1000)
   * @param verificationCount How many other users confirmed this report
   * @param reportAgeMinutes How long ago the report was made
   */
  calculateReportConfidence(
    userScore: number,
    verificationCount: number,
    reportAgeMinutes: number
  ): number {
    // Base confidence from user reputation (scaled to 0.5)
    const baseConfidence = (userScore / 1000) * 0.5;

    // Boost from other users verifying the report (scaled to 0.5)
    const verificationBoost = Math.min(verificationCount * 0.1, 0.5);

    // Decay over time (e.g., a pothole lasts longer than a police speed trap)
    const decayFactor = Math.max(1 - (reportAgeMinutes / 60), 0.1);

    return (baseConfidence + verificationBoost) * decayFactor;
  }

  /**
   * Adjusts a user's reputation based on the accuracy of their reports
   */
  updateUserReputation(currentScore: number, isAccurate: boolean): number {
    const change = isAccurate ? 10 : -25; // Penalize incorrect reports more heavily
    return Math.min(Math.max(currentScore + change, 0), 1000);
  }
}
