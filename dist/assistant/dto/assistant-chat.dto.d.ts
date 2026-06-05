export declare class AssistantLocationDto {
    lat: number;
    lng: number;
}
export declare class AssistantChatDto {
    message: string;
    userId?: string;
    sessionId?: string;
    location?: AssistantLocationDto;
    activeRouteId?: string;
    vehicleType?: string;
    language?: string;
    source?: 'TEXT' | 'VOICE' | 'QUICK_ACTION';
    radiusMeters?: number;
}
