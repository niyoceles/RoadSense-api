import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    findNearby(lat: number, lng: number): Promise<{
        id: string;
        title: string;
        message: string;
        latitude: number;
        longitude: number;
    }[]>;
}
