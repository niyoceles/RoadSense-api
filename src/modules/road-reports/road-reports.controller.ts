import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto';
import { RoadReportsService } from './road-reports.service';

@ApiTags('reports')
@Controller('reports')
export class RoadReportsController {
  constructor(private readonly reportsService: RoadReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new road report' })
  async create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get reports within a radius' })
  @ApiQuery({ name: 'lat', type: Number })
  @ApiQuery({ name: 'lng', type: Number })
  @ApiQuery({ name: 'radius', type: Number, description: 'Radius in meters' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number,
  ) {
    return this.reportsService.findNearby(lat, lng, radius);
  }
}
