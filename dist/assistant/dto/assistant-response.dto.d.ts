import { HazardReportIntentDto } from './hazard-report-intent.dto';
export declare class ConfirmAssistantActionDto {
    actionId: string;
    payload: HazardReportIntentDto;
}
export declare class AssistantResponseDto {
    success: boolean;
    type: string;
    assistantMessage: string;
    speakableMessage?: string;
    suggestedActions?: Array<Record<string, unknown>>;
    data?: Record<string, unknown>;
}
