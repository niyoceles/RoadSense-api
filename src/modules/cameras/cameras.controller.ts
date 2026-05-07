import { Controller, Get, Query } from '@nestjs/common';
import { CamerasService } from './cameras.service';

@Controller('cameras')
export class CamerasController {
  constructor(private readonly camerasService: CamerasService) {}

  @Get('nearby')
  async getNearbyCameras(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 5000,
  ) {
    return this.camerasService.getNearbyCameras(
      Number(lat),
      Number(lng),
      Number(radius),
    );
  }
}
