import { Type } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HazardReportIntentDto } from './hazard-report-intent.dto';

export class ConfirmAssistantActionDto {
  @IsString()
  @IsIn(['confirm_hazard_report'])
  actionId: string;

  @ValidateNested()
  @Type(() => HazardReportIntentDto)
  payload: HazardReportIntentDto;
}

export class AssistantResponseDto {
  success: boolean;
  type: string;
  assistantMessage: string;
  speakableMessage?: string;
  suggestedActions?: Array<Record<string, unknown>>;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
