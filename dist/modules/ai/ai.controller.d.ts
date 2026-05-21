import { AiChatRequestDto } from './dto/ai-chat-request.dto';
import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(request: AiChatRequestDto): Promise<{
        text: string;
        raw: string;
    }>;
}
