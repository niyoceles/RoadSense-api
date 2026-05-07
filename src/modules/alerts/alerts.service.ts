import { Injectable } from '@nestjs/common';

@Injectable()
export class AlertsService {
  async findNearby(lat: number, lng: number) {
    return [
      { id: '1', title: 'Flood Warning', message: 'Heavy rain expected in Nyarugenge', latitude: lat, longitude: lng },
    ];
  }
}
