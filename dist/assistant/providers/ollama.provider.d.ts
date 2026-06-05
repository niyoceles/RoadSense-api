import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AssistantChatDto } from '../dto/assistant-chat.dto';
import { AssistantLlmProvider } from './assistant-llm.provider';
import { LlmToolIntent } from '../types/assistant.types';
export declare class OllamaProvider extends AssistantLlmProvider {
    private readonly http;
    private readonly config;
    private readonly logger;
    constructor(http: HttpService, config: ConfigService);
    classifyIntent(request: AssistantChatDto): Promise<LlmToolIntent | null>;
    private buildPrompt;
}
