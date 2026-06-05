import { AssistantChatDto } from '../dto/assistant-chat.dto';
import { LlmToolIntent } from '../types/assistant.types';

export abstract class AssistantLlmProvider {
  abstract classifyIntent(request: AssistantChatDto): Promise<LlmToolIntent | null>;
}
