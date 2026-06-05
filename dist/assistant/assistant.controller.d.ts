import { AssistantService } from './assistant.service';
import { AssistantChatDto } from './dto/assistant-chat.dto';
import { ConfirmAssistantActionDto } from './dto/assistant-response.dto';
export declare class AssistantController {
    private readonly assistantService;
    constructor(assistantService: AssistantService);
    chat(dto: AssistantChatDto): Promise<import("./types/assistant.types").AssistantResponse>;
    confirmAction(dto: ConfirmAssistantActionDto): Promise<import("./types/assistant.types").AssistantResponse>;
}
