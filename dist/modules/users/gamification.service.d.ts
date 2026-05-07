export declare enum ActionType {
    REPORT_HAZARD = "report_hazard",
    REPORT_CAMERA = "report_camera",
    VERIFY_REPORT = "verify_report",
    DRIVE_KM = "drive_km"
}
export declare class GamificationService {
    private readonly POINTS_MAP;
    awardPoints(userId: string, action: ActionType): {
        pointsGained: number;
        totalPoints: number;
        newRank: string;
    };
    private calculateRank;
}
