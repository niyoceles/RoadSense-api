import { IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export enum ReportType {
  TRAFFIC = 'traffic',
  POLICE = 'police',
  CRASH = 'crash',
  HAZARD = 'hazard',
  FLOOD = 'flood',
  CLOSURE = 'closure',
  POTHOLE = 'pothole',
  BAD_ROAD = 'bad_road',
  ACCIDENT = 'accident',
  SPEED_CAMERA = 'speed_camera',
}

export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateReportDto {
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsEnum(Severity)
  @IsNotEmpty()
  severity: Severity;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
