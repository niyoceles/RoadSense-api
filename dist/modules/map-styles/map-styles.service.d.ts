import { ConfigService } from '@nestjs/config';
type MapStyleId = 'default' | 'satellite' | 'hybrid';
export interface PublicMapStyleConfig {
    id: MapStyleId;
    label: string;
    styleUrl: string;
    description: string;
}
export declare class MapStylesService {
    private readonly config;
    constructor(config: ConfigService);
    getStyleConfig(): Record<MapStyleId, PublicMapStyleConfig>;
    getStyleDocument(styleId: string): Record<string, unknown> | null;
    private defaultStyle;
    private satelliteStyle;
    private hybridStyle;
    private osmVectorSource;
    private osmRasterSource;
    private sentinelRasterSource;
    private glyphsUrl;
    private publicBaseUrl;
    private validUrl;
    private fillLayer;
    private lineLayer;
    private symbolLayer;
}
export {};
