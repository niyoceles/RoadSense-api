export declare class ReputationService {
    calculateReportConfidence(userScore: number, verificationCount: number, reportAgeMinutes: number): number;
    updateUserReputation(currentScore: number, isAccurate: boolean): number;
}
