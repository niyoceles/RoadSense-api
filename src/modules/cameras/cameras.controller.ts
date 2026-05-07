import { Controller, Get, Query } from '@nestjs/common';
import { CamerasService } from './cameras.service';

@Controller('cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get('nearby')
  async getNearbyCameras(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number,
  ) {
    // In production, we would use lat/lng/radius to do a PostGIS ST_DWithin query.
    // For now, we return the mock database from the service.
    return this.camerasService.getCamerasAlongRoute(null);
  }
}
