import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AiChatRequestDto } from './dto/ai-chat-request.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async chat(request: AiChatRequestDto) {
    const prompt = request.prompt?.trim();
    if (!prompt) {
      return { text: 'Ask me anything about your drive.', raw: '' };
    }

    const ollamaUrl =
      this.config.get<string>('OLLAMA_BASE_URL') ?? 'http://ollama:11434';
    const model = this.config.get<string>('OLLAMA_MODEL') ?? 'mistral';
    const systemPrompt = this.buildSystemPrompt(request.context ?? {});

    let conversation = '';
    if (request.history && request.history.length > 0) {
      const activeHistory = request.history.slice(-10);
      for (const msg of activeHistory) {
        if (msg.role === 'user') {
          conversation += `Driver: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          const content = msg.content
            .split('ACTION_NAV:')[0]
            .split('ACTION_SEARCH:')[0]
            .trim();
          if (content) {
            conversation += `RoadSense Copilot: ${content}\n`;
          }
        }
      }
    }

    try {
      const response = await firstValueFrom(
        this.http.post(
          `${ollamaUrl}/api/generate`,
          {
            model,
            prompt: `${systemPrompt}\n\n${conversation}Driver: ${prompt}\nRoadSense Copilot:`,
            stream: false,
            options: {
              temperature: 0.55,
              num_predict: 384,
            },
          },
          { timeout: 60000 },
        ),
      );

      const text = String(response.data?.response ?? '').trim();
      return {
        text:
          text ||
          "I couldn't generate a useful answer right now. Try asking again with a little more detail.",
        raw: text,
      };
    } catch (error) {
      throw new BadGatewayException(
        `AI model is not reachable at ${ollamaUrl}. Check that Ollama is running and the model is pulled.`,
      );
    }
  }

  private buildSystemPrompt(context: Record<string, unknown>) {
    return `
You are RoadSense Copilot, a real driving assistant inside a navigation app.
Use the provided live driving context. Do not pretend to know exact live data that is not present.
Keep replies brief, practical, and natural: 1 to 3 short sentences.

If the driver asks to navigate or search for a place, include one command block at the end:
ACTION_NAV: {"lat": -1.9441, "lng": 30.0619, "name": "Place name", "address": "Address"}
or
ACTION_SEARCH: {"query": "fuel", "tag": "amenity:fuel", "label": "Fuel"}

Live context JSON:
${JSON.stringify(context, null, 2)}
`.trim();
  }
}
