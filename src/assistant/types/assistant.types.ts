export type AssistantSource = 'TEXT' | 'VOICE' | 'QUICK_ACTION';

export type AssistantResponseType =
  | 'GENERAL_HELP'
  | 'NEARBY_HAZARDS'
  | 'HAZARD_REPORT_DRAFT'
  | 'HAZARD_REPORT_CONFIRMED'
  | 'ROUTE_EXPLANATION'
  | 'SAFETY_GUIDANCE'
  | 'CLARIFICATION'
  | 'ERROR';

export type AssistantActionType =
  | 'CONFIRM_ACTION'
  | 'DISMISS'
  | 'QUICK_REPLY'
  | 'START_NAVIGATION';

export interface AssistantAction {
  id: string;
  label: string;
  type: AssistantActionType;
  payload?: Record<string, unknown>;
}

export interface AssistantLocation {
  lat: number;
  lng: number;
}

export interface AssistantResponse {
  success: boolean;
  type: AssistantResponseType;
  assistantMessage: string;
  speakableMessage?: string;
  suggestedActions?: AssistantAction[];
  data?: Record<string, unknown>;
}

export interface LlmToolIntent {
  intent:
    | 'HELP'
    | 'FIND_NEARBY_HAZARDS'
    | 'REPORT_HAZARD'
    | 'NAVIGATION_DESTINATION'
    | 'EXPLAIN_ROUTE'
    | 'SAFETY'
    | 'CLARIFY';
  hazardType?: string;
  destination?: string;
  confidence?: number;
}
