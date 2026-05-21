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
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.reportsService.findAll(includeInactive === 'true');
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
    @Query('limit') limit?: number,
  ) {
    return this.reportsService.findNearby(Number(lat), Number(lng), Number(radius), Number(limit));
  }

  @Post('route')
  @ApiOperation({ summary: 'Get active reports near a route polyline' })
  async findNearRoute(@Body() body: { route: Array<{ lat: number; lng: number }>; corridorMeters?: number; limit?: number }) {
    return this.reportsService.findNearRoute(
      body.route || [],
      Number(body.corridorMeters),
      Number(body.limit),
    );
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a road report is still present' })
  async confirm(@Param('id') id: string, @Body() body: { userId?: string; sessionId?: string }) {
    return this.reportsService.confirm(id, body);
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a road report as not present' })
  async dismissPost(@Param('id') id: string, @Body() body: { userId?: string; sessionId?: string }) {
    return this.reportsService.dismiss(id, body);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify a road report' })
  async verify(@Param('id') id: string) {
    return this.reportsService.verify(id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Mark a road report as not currently present' })
  async dismiss(@Param('id') id: string) {
    return this.reportsService.dismiss(id, {});
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a road report' })
  async reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.reportsService.reject(id, body?.reason);
  }

  @Patch(':id/expire')
  @ApiOperation({ summary: 'Expire a road report' })
  async expire(@Param('id') id: string) {
    return this.reportsService.expire(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a road report' })
  async delete(@Param('id') id: string) {
    return this.reportsService.delete(id);
  }
}
