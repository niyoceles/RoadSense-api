import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AssistantChatDto } from '../dto/assistant-chat.dto';
import { AssistantLlmProvider } from './assistant-llm.provider';
import { LlmToolIntent } from '../types/assistant.types';

@Injectable()
export class OllamaProvider extends AssistantLlmProvider {
  private readonly logger = new Logger(OllamaProvider.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async classifyIntent(request: AssistantChatDto): Promise<LlmToolIntent | null> {
    if (this.config.get<string>('ASSISTANT_ENABLED', 'true') === 'false') {
      return null;
    }
    if (this.config.get<string>('ASSISTANT_PROVIDER', 'ollama') !== 'ollama') {
      return null;
    }

    const baseUrl = this.config.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    const model = this.config.get<string>('OLLAMA_MODEL', 'qwen3:8b');
    const timeout = Number(this.config.get<string>('ASSISTANT_TIMEOUT_MS', '15000'));

    try {
      const response = await firstValueFrom(
        this.http.post(
          `${baseUrl}/api/generate`,
          {
            model,
            stream: false,
            format: 'json',
            options: { temperature: 0.1, num_predict: 160 },
            prompt: this.buildPrompt(request.message),
          },
          { timeout },
        ),
      );
      const raw = String(response.data?.response ?? '').trim();
      const parsed = JSON.parse(raw) as LlmToolIntent;
      return parsed?.intent ? parsed : null;
    } catch (error) {
      this.logger.warn('Assistant LLM unavailable; using deterministic fallback.');
      return null;
    }
  }

  private buildPrompt(message: string) {
    return `
Classify this RoadSense driver assistant request. Return only JSON.
Valid intents: HELP, FIND_NEARBY_HAZARDS, REPORT_HAZARD, NAVIGATION_DESTINATION, EXPLAIN_ROUTE, SAFETY, CLARIFY.
For hazard reports, hazardType must be one of pothole, accident, crash, flood, hazard, traffic, closure.
For navigation, route, destination, or distance requests, set intent NAVIGATION_DESTINATION and destination to the requested place name.
Examples that are NAVIGATION_DESTINATION: "take me to [place]", "distance from here to [place]", "how far to [place]", "how about [place]".
Message: ${JSON.stringify(message)}
JSON shape: {"intent":"NAVIGATION_DESTINATION","destination":"place name","confidence":0.8}
`.trim();
  }
}
