"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AiService = class AiService {
    constructor(http, config) {
        this.http = http;
        this.config = config;
    }
    async chat(request) {
        const prompt = request.prompt?.trim();
        if (!prompt) {
            return { text: 'Ask me anything about your drive.', raw: '' };
        }
        const ollamaUrl = this.config.get('OLLAMA_BASE_URL') ?? 'http://ollama:11434';
        const model = this.config.get('OLLAMA_MODEL') ?? 'mistral';
        const systemPrompt = this.buildSystemPrompt(request.context ?? {});
        let conversation = '';
        if (request.history && request.history.length > 0) {
            const activeHistory = request.history.slice(-10);
            for (const msg of activeHistory) {
                if (msg.role === 'user') {
                    conversation += `Driver: ${msg.content}\n`;
                }
                else if (msg.role === 'assistant') {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.http.post(`${ollamaUrl}/api/generate`, {
                model,
                prompt: `${systemPrompt}\n\n${conversation}Driver: ${prompt}\nRoadSense Copilot:`,
                stream: false,
                options: {
                    temperature: 0.55,
                    num_predict: 384,
                },
            }, { timeout: 60000 }));
            const text = String(response.data?.response ?? '').trim();
            return {
                text: text ||
                    "I couldn't generate a useful answer right now. Try asking again with a little more detail.",
                raw: text,
            };
        }
        catch (error) {
            throw new common_1.BadGatewayException(`AI model is not reachable at ${ollamaUrl}. Check that Ollama is running and the model is pulled.`);
        }
    }
    buildSystemPrompt(context) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map