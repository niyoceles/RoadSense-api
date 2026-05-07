export declare class AlertsService {
    findNearby(lat: number, lng: number): Promise<{
        id: string;
        title: string;
        message: string;
        latitude: number;
        longitude: number;
    }[]>;
}
