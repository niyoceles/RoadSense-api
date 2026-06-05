import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeocodingTool {
  private readonly logger = new Logger(GeocodingTool.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async geocodeDestination(query: string) {
    const cleanQuery = query.trim().slice(0, 120);
    if (!cleanQuery) return null;

    const hint = this.config.get<string>('GEOCODING_QUERY_HINT', '').trim();
    const providerUrl = this.config.get<string>('GEOCODING_PROVIDER_URL')?.trim();
    const userAgent = this.config.get<string>('GEOCODING_USER_AGENT')?.trim();
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
        const response = await firstValueFrom(
          this.http.get(providerUrl, {
            params: { q, limit: 1 },
            timeout: 8000,
            headers: { 'User-Agent': userAgent },
          }),
        );
        const feature = response.data?.features?.[0];
        const coords = feature?.geometry?.coordinates;
        if (!coords) continue;
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
      } catch (error) {
        this.logger.warn('Geocoding provider unavailable for assistant request.');
      }
    }

    return null;
  }
}
