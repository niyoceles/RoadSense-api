import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MapStylesService } from './map-styles.service';

@ApiTags('map-styles')
@Controller()
export class MapStylesController {
  constructor(private readonly mapStylesService: MapStylesService) {}

  @Get('map/styles')
  @ApiOperation({ summary: 'Get public MapLibre style configuration' })
  getStyles() {
    return this.mapStylesService.getStyleConfig();
  }

  @Get('styles/:styleId.json')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({ summary: 'Get a RoadSense MapLibre style document' })
  @ApiParam({ name: 'styleId', enum: ['default', 'satellite', 'hybrid'] })
  getStyle(@Param('styleId') styleId: string) {
    const style = this.mapStylesService.getStyleDocument(styleId);
    if (!style) {
      throw new NotFoundException(`Unknown map style: ${styleId}`);
    }
    return style;
  }
}
