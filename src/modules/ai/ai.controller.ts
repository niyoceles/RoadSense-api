import { Body, Controller, Post } from '@nestjs/common';
import { AiChatRequestDto } from './dto/ai-chat-request.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() request: AiChatRequestDto) {
    return this.aiService.chat(request);
  }
}
