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
var OllamaProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const assistant_llm_provider_1 = require("./assistant-llm.provider");
let OllamaProvider = OllamaProvider_1 = class OllamaProvider extends assistant_llm_provider_1.AssistantLlmProvider {
    constructor(http, config) {
        super();
        this.http = http;
        this.config = config;
        this.logger = new common_1.Logger(OllamaProvider_1.name);
    }
    async classifyIntent(request) {
        if (this.config.get('ASSISTANT_ENABLED', 'true') === 'false') {
            return null;
        }
        if (this.config.get('ASSISTANT_PROVIDER', 'ollama') !== 'ollama') {
            return null;
        }
        const baseUrl = this.config.get('OLLAMA_BASE_URL', 'http://localhost:11434');
        const model = this.config.get('OLLAMA_MODEL', 'qwen3:8b');
        const timeout = Number(this.config.get('ASSISTANT_TIMEOUT_MS', '15000'));
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.http.post(`${baseUrl}/api/generate`, {
                model,
                stream: false,
                format: 'json',
                options: { temperature: 0.1, num_predict: 160 },
                prompt: this.buildPrompt(request.message),
            }, { timeout }));
            const raw = String(response.data?.response ?? '').trim();
            const parsed = JSON.parse(raw);
            return parsed?.intent ? parsed : null;
        }
        catch (error) {
            this.logger.warn('Assistant LLM unavailable; using deterministic fallback.');
            return null;
        }
    }
    buildPrompt(message) {
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
};
exports.OllamaProvider = OllamaProvider;
exports.OllamaProvider = OllamaProvider = OllamaProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], OllamaProvider);
//# sourceMappingURL=ollama.provider.js.map