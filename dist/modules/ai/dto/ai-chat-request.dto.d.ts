export declare class AiChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare class AiChatRequestDto {
    prompt: string;
    context?: Record<string, unknown>;
    history?: AiChatMessage[];
}
