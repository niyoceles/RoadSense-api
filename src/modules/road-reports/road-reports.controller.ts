import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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

  @Get()
  @ApiOperation({ summary: 'Get all road reports' })
  async findAll() {
    return this.reportsService.findAll();
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

  @Patch(':id')
  @ApiOperation({ summary: 'Verify a road report' })
  async verify(@Param('id') id: string) {
    return this.reportsService.verify(id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Mark a road report as not currently present' })
  async dismiss(@Param('id') id: string) {
    return this.reportsService.dismiss(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a road report' })
  async delete(@Param('id') id: string) {
    return this.reportsService.delete(id);
  }
}
