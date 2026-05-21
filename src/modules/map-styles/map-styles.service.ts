import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type MapStyleId = 'default' | 'satellite' | 'hybrid';

export interface PublicMapStyleConfig {
  id: MapStyleId;
  label: string;
  styleUrl: string;
  description: string;
}

@Injectable()
export class MapStylesService {
  constructor(private readonly config: ConfigService) {}

  getStyleConfig(): Record<MapStyleId, PublicMapStyleConfig> {
    const baseUrl = this.publicBaseUrl();
    return {
      default: {
        id: 'default',
        label: 'Default',
        styleUrl: this.validUrl(
          this.config.get<string>('MAP_DEFAULT_STYLE_URL'),
          'https://tiles.openfreemap.org/styles/bright',
        ),
        description: 'OSM vector map',
      },
      satellite: {
        id: 'satellite',
        label: 'Satellite',
        styleUrl: this.validUrl(
          this.config.get<string>('MAP_SATELLITE_STYLE_URL'),
          `${baseUrl}/styles/satellite.json`,
        ),
        description: 'Open-data Sentinel-2 / Copernicus satellite imagery',
      },
      hybrid: {
        id: 'hybrid',
        label: 'Hybrid',
        styleUrl: this.validUrl(
          this.config.get<string>('MAP_HYBRID_STYLE_URL'),
          `${baseUrl}/styles/hybrid.json`,
        ),
        description: 'Satellite base with OSM roads, labels, route, and hazard overlays',
      },
    };
  }

  getStyleDocument(styleId: string): Record<string, unknown> | null {
    if (styleId === 'default') return this.defaultStyle();
    if (styleId === 'satellite') return this.satelliteStyle();
    if (styleId === 'hybrid') return this.hybridStyle();
    return null;
  }

  private defaultStyle(): Record<string, unknown> {
    return {
      version: 8,
      name: 'RoadSense Default',
      glyphs: this.glyphsUrl(),
      sources: {
        osmRaster: this.osmRasterSource(),
        openmaptiles: this.osmVectorSource(),
      },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#EAF1F3' } },
        {
          id: 'osm-raster-base',
          type: 'raster',
          source: 'osmRaster',
          paint: { 'raster-opacity': 1 },
        },
        this.fillLayer('water', 'water', '#A9D6E8'),
        this.fillLayer('landcover', 'landcover', '#DDEBD8', 0.35),
        this.fillLayer('park', 'park', '#CFE8C8', 0.55),
        this.fillLayer('building', 'building', '#D0D5D8', 0.75, 14),
        this.lineLayer('minor-roads', 'transportation', '#FFFFFF', 1.1, ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track']]], 12),
        this.lineLayer('major-roads-casing', 'transportation', '#B7C0C8', 5.8, ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]], 6),
        this.lineLayer('major-roads', 'transportation', '#FFFFFF', 3.6, ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]], 6),
        this.symbolLayer('road-labels', 'transportation_name', ['get', 'name'], '#34404A', 12, 12),
        this.symbolLayer('poi-labels', 'poi', ['coalesce', ['get', 'name'], ['get', 'name:en']], '#475569', 11, 14),
        this.symbolLayer('place-labels', 'place', ['coalesce', ['get', 'name'], ['get', 'name:en']], '#17202A', 14, 5),
      ],
    };
  }

  private satelliteStyle(): Record<string, unknown> {
    return {
      version: 8,
      name: 'RoadSense Satellite',
      glyphs: this.glyphsUrl(),
      sources: {
        sentinel2: this.sentinelRasterSource(),
      },
      layers: [
        {
          id: 'sentinel2-base',
          type: 'raster',
          source: 'sentinel2',
          paint: {
            'raster-opacity': 1,
            'raster-contrast': 0.12,
            'raster-saturation': 0.18,
          },
        },
      ],
    };
  }

  private hybridStyle(): Record<string, unknown> {
    return {
      version: 8,
      name: 'RoadSense Hybrid',
      glyphs: this.glyphsUrl(),
      sources: {
        sentinel2: this.sentinelRasterSource(),
        osmRaster: this.osmRasterSource(),
        openmaptiles: this.osmVectorSource(),
      },
      layers: [
        {
          id: 'sentinel2-base',
          type: 'raster',
          source: 'sentinel2',
          paint: {
            'raster-opacity': 1,
            'raster-contrast': 0.1,
            'raster-saturation': 0.12,
          },
        },
        {
          id: 'hybrid-osm-readable-overlay',
          type: 'raster',
          source: 'osmRaster',
          paint: { 'raster-opacity': 0.48 },
          minzoom: 10,
        },
        this.lineLayer('hybrid-minor-roads', 'transportation', '#F6F7F2', 1.2, ['in', ['get', 'class'], ['literal', ['minor', 'service', 'track']]], 13),
        this.lineLayer('hybrid-major-roads-casing', 'transportation', '#233142', 6.4, ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]], 6),
        this.lineLayer('hybrid-major-roads', 'transportation', '#FFF7D1', 3.9, ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]], 6),
        this.symbolLayer('hybrid-road-labels', 'transportation_name', ['get', 'name'], '#FFFFFF', 12, 12, '#18202A'),
        this.symbolLayer('hybrid-place-labels', 'place', ['coalesce', ['get', 'name'], ['get', 'name:en']], '#FFFFFF', 14, 5, '#18202A'),
      ],
    };
  }

  private osmVectorSource() {
    return {
      type: 'vector',
      tiles: [
        this.validUrl(
          this.config.get<string>('MAP_VECTOR_TILE_URL'),
          'http://localhost:3001/{z}/{x}/{y}.pbf',
        ),
      ],
      minzoom: 0,
      maxzoom: 14,
      attribution: '© OpenStreetMap contributors',
    };
  }

  private osmRasterSource() {
    // Development fallback so the app remains readable if Martin is running
    // without OpenMapTiles-compatible OSM layers. Production should replace
    // this with RoadSense-hosted raster or vector tiles.
    return {
      type: 'raster',
      tiles: [
        this.validUrl(
          this.config.get<string>('MAP_OSM_RASTER_TILE_URL'),
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ),
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    };
  }

  private sentinelRasterSource() {
    // Keep this source open-data only. Do not replace it with Google, Bing,
    // Mapbox proprietary imagery, scraped endpoints, or unlicensed tiles.
    return {
      type: 'raster',
      tiles: [
        this.validUrl(
          this.config.get<string>('MAP_SENTINEL_TILE_URL'),
          'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg',
        ),
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 13,
      attribution:
        'Sentinel-2 cloudless - https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data)',
    };
  }

  private glyphsUrl(): string {
    return this.validUrl(
      this.config.get<string>('MAP_GLYPHS_URL'),
      'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    );
  }

  private publicBaseUrl(): string {
    return this.validUrl(
      this.config.get<string>('PUBLIC_API_BASE_URL'),
      'http://localhost:3000',
    ).replace(/\/$/, '');
  }

  private validUrl(value: string | undefined, fallback: string): string {
    const candidate = value?.trim() || fallback;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return candidate;
      }
    } catch {
      // Fall through to the known safe development default.
    }
    return fallback;
  }

  private fillLayer(
    id: string,
    sourceLayer: string,
    color: string,
    opacity = 1,
    minzoom = 0,
  ) {
    return {
      id,
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': sourceLayer,
      minzoom,
      paint: { 'fill-color': color, 'fill-opacity': opacity },
    };
  }

  private lineLayer(
    id: string,
    sourceLayer: string,
    color: string,
    width: number,
    filter: unknown[],
    minzoom = 0,
  ) {
    return {
      id,
      type: 'line',
      source: 'openmaptiles',
      'source-layer': sourceLayer,
      minzoom,
      filter,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': color, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, width, 16, width * 2.3] },
    };
  }

  private symbolLayer(
    id: string,
    sourceLayer: string,
    textField: unknown[],
    color: string,
    size: number,
    minzoom = 0,
    haloColor = '#FFFFFF',
  ) {
    return {
      id,
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': sourceLayer,
      minzoom,
      layout: {
        'text-field': textField,
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 6, size - 2, 16, size + 2],
        'text-max-width': 8,
      },
      paint: {
        'text-color': color,
        'text-halo-color': haloColor,
        'text-halo-width': 1.2,
      },
    };
  }
}
