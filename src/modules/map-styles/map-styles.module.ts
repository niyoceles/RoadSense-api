import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MapStylesController } from './map-styles.controller';
import { MapStylesService } from './map-styles.service';

@Module({
  imports: [ConfigModule],
  controllers: [MapStylesController],
  providers: [MapStylesService],
})
export class MapStylesModule {}
