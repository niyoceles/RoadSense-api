export declare enum ReportType {
    TRAFFIC = "traffic",
    POLICE = "police",
    CRASH = "crash",
    HAZARD = "hazard",
    FLOOD = "flood",
    CLOSURE = "closure",
    POTHOLE = "pothole",
    BAD_ROAD = "bad_road",
    ACCIDENT = "accident",
    SPEED_CAMERA = "speed_camera"
}
export declare enum Severity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class CreateReportDto {
    type: ReportType;
    severity: Severity;
    description?: string;
    latitude: number;
    longitude: number;
    imageUrl?: string;
}
