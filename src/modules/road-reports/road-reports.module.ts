import { Module } from '@nestjs/common';
import { RoadReportsController } from './road-reports.controller';
import { RoadReportsService } from './road-reports.service';

@Module({
  controllers: [RoadReportsController],
  providers: [RoadReportsService],
  exports: [RoadReportsService],
})
export class RoadReportsModule {}
