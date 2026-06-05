"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GeocodingTool_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeocodingTool = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let GeocodingTool = GeocodingTool_1 = class GeocodingTool {
    constructor(http, config) {
        this.http = http;
        this.config = config;
        this.logger = new common_1.Logger(GeocodingTool_1.name);
    }
    async geocodeDestination(query) {
        const cleanQuery = query.trim().slice(0, 120);
        if (!cleanQuery)
            return null;
        const hint = this.config.get('GEOCODING_QUERY_HINT', '').trim();
        const providerUrl = this.config.get('GEOCODING_PROVIDER_URL')?.trim();
        const userAgent = this.config.get('GEOCODING_USER_AGENT')?.trim();
        if (!providerUrl || !userAgent) {
            this.logger.warn('Geocoding provider is not configured.');
            return null;
        }
        const queries = [
            ...(hint && !cleanQuery.toLowerCase().includes(hint.toLowerCase())
                ? [`${cleanQuery}, ${hint}`]
                : []),
            cleanQuery,
        ];
        for (const q of queries) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.http.get(providerUrl, {
                    params: { q, limit: 1 },
                    timeout: 8000,
                    headers: { 'User-Agent': userAgent },
                }));
                const feature = response.data?.features?.[0];
                const coords = feature?.geometry?.coordinates;
                if (!coords)
                    continue;
                const country = String(feature.properties?.country ?? '');
                if (hint && country && !country.toLowerCase().includes(hint.toLowerCase())) {
                    continue;
                }
                return {
                    lat: coords[1],
                    lng: coords[0],
                    name: feature.properties?.name || cleanQuery,
                    address: [
                        feature.properties?.street,
                        feature.properties?.city,
                        feature.properties?.country,
                    ]
                        .filter(Boolean)
                        .join(', '),
                };
            }
            catch (error) {
                this.logger.warn('Geocoding provider unavailable for assistant request.');
            }
        }
        return null;
    }
};
exports.GeocodingTool = GeocodingTool;
exports.GeocodingTool = GeocodingTool = GeocodingTool_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], GeocodingTool);
//# sourceMappingURL=geocoding-tool.js.map