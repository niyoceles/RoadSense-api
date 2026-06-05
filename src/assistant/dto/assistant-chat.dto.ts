import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AssistantLocationDto {
  @IsNumber()
  @IsLatitude()
  lat: number;

  @IsNumber()
  @IsLongitude()
  lng: number;
}

export class AssistantChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @ValidateNested()
  @Type(() => AssistantLocationDto)
  @IsOptional()
  location?: AssistantLocationDto;

  @IsString()
  @IsOptional()
  activeRouteId?: string;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsIn(['TEXT', 'VOICE', 'QUICK_ACTION'])
  @IsOptional()
  source?: 'TEXT' | 'VOICE' | 'QUICK_ACTION';

  @IsNumber()
  @Min(50)
  @Max(10000)
  @IsOptional()
  radiusMeters?: number;
}
