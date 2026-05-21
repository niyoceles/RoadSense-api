import { MapStylesService } from './map-styles.service';
export declare class MapStylesController {
    private readonly mapStylesService;
    constructor(mapStylesService: MapStylesService);
    getStyles(): Record<"default" | "satellite" | "hybrid", import("./map-styles.service").PublicMapStyleConfig>;
    getStyle(styleId: string): Record<string, unknown>;
}
