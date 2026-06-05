import { HazardTool } from './hazard-tool';
export declare class SafetyTool {
    private readonly hazardTool;
    constructor(hazardTool: HazardTool);
    getSafetySummary(lat?: number, lng?: number, radiusMeters?: number): Promise<{
        hasLocation: boolean;
        summary: string;
        hazardCount?: undefined;
    } | {
        hasLocation: boolean;
        hazardCount: number;
        summary: string;
    }>;
}
