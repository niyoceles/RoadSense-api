import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { AssistantChatDto } from './dto/assistant-chat.dto';
import { ConfirmAssistantActionDto } from './dto/assistant-response.dto';

@ApiTags('assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with RoadSense AI Co-Pilot' })
  chat(@Body() dto: AssistantChatDto) {
    return this.assistantService.chat(dto);
  }

  @Post('actions/confirm')
  @ApiOperation({ summary: 'Confirm a sensitive assistant action' })
  confirmAction(@Body() dto: ConfirmAssistantActionDto) {
    return this.assistantService.confirmAction(dto);
  }
}
