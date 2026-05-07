import { Controller, Get, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('nearby')
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return this.alertsService.findNearby(lat, lng);
  }
}
