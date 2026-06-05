import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class GeocodingTool {
    private readonly http;
    private readonly config;
    private readonly logger;
    constructor(http: HttpService, config: ConfigService);
    geocodeDestination(query: string): Promise<{
        lat: any;
        lng: any;
        name: any;
        address: string;
    }>;
}
