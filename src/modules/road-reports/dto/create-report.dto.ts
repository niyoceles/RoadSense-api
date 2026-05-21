import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  Max,
  Min,
} from 'class-validator';

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
  @Min(-90)
  @Max(90)
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  speedLimit?: number;

  @IsNumber()
  @IsOptional()
  directionDegrees?: number;

  @IsString()
  @IsOptional()
  roadSegmentId?: string;

  @IsString()
  @IsOptional()
  cameraType?: 'fixed' | 'mobile' | 'red_light';

  @IsString()
  @IsOptional()
  reportedBy?: string;

  @IsString()
  @IsOptional()
  source?: 'user' | 'admin' | 'system' | 'official_feed';
}
