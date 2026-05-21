export class AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AiChatRequestDto {
  prompt: string;
  context?: Record<string, unknown>;
  history?: AiChatMessage[];
}
