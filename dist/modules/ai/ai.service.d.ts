import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AiChatRequestDto } from './dto/ai-chat-request.dto';
export declare class AiService {
    private readonly http;
    private readonly config;
    constructor(http: HttpService, config: ConfigService);
    chat(request: AiChatRequestDto): Promise<{
        text: string;
        raw: string;
    }>;
    private buildSystemPrompt;
}
