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
var AssistantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const assistant_llm_provider_1 = require("./providers/assistant-llm.provider");
const assistant_tools_service_1 = require("./tools/assistant-tools.service");
const create_report_dto_1 = require("../modules/road-reports/dto/create-report.dto");
let AssistantService = AssistantService_1 = class AssistantService {
    constructor(llm, tools, config) {
        this.llm = llm;
        this.tools = tools;
        this.config = config;
        this.logger = new common_1.Logger(AssistantService_1.name);
    }
    async chat(request) {
        const message = request.message.trim();
        if (!message) {
            return this.clarify('What would you like help with?');
        }
        try {
            const llmIntent = await this.llm.classifyIntent(request);
            const fallbackIntent = this.classifyFallback(message);
            const intent = this.shouldUseFallback(llmIntent, fallbackIntent)
                ? fallbackIntent
                : llmIntent;
            return this.executeIntent(request, intent);
        }
        catch (error) {
            this.logger.warn('Assistant request failed; returning safe fallback.');
            return {
                success: false,
                type: 'ERROR',
                assistantMessage: 'I could not process that safely right now. You can still use the report button or ask for help.',
                speakableMessage: 'I could not process that safely right now.',
            };
        }
    }
    async confirmAction(dto) {
        if (dto.actionId !== 'confirm_hazard_report') {
            return this.clarify('I cannot confirm that action.');
        }
        try {
            const report = await this.tools.confirmHazardReport(dto.payload);
            return {
                success: true,
                type: 'HAZARD_REPORT_CONFIRMED',
                assistantMessage: `${this.humanHazard(dto.payload.hazardType)} report submitted successfully. Other drivers nearby will be warned.`,
                speakableMessage: `${this.humanHazard(dto.payload.hazardType)} report submitted successfully.`,
                data: { report },
            };
        }
        catch (error) {
            this.logger.warn('Assistant hazard confirmation failed.');
            return {
                success: false,
                type: 'ERROR',
                assistantMessage: 'I could not submit that report. Please use the report screen or try again when the connection is stable.',
                speakableMessage: 'I could not submit that report.',
            };
        }
    }
    async executeIntent(request, intent) {
        switch (intent.intent) {
            case 'HELP':
                return {
                    success: true,
                    type: 'GENERAL_HELP',
                    assistantMessage: 'I can explain routes, check nearby hazards, draft pothole, accident, or flood reports, and give short safety guidance. Use voice when driving.',
                    speakableMessage: 'I can explain routes, check nearby hazards, draft reports, and give safety guidance.',
                    suggestedActions: this.quickActions(),
                };
            case 'FIND_NEARBY_HAZARDS':
                return this.nearbyHazards(request);
            case 'REPORT_HAZARD':
                return this.hazardDraft(request, intent);
            case 'NAVIGATION_DESTINATION':
                return this.navigationDestination(request, intent);
            case 'EXPLAIN_ROUTE':
                return this.routeExplanation(request);
            case 'SAFETY':
                return this.safetySummary(request);
            default:
                return this.clarify('Can you say that another way? I can help with hazards, routes, reports, or safety.');
        }
    }
    async nearbyHazards(request) {
        if (!request.location) {
            return this.clarify('Share your location first so I can check nearby hazards.');
        }
        const hazards = await this.tools.findNearbyHazards(request.location.lat, request.location.lng, request.radiusMeters ?? 1500);
        if (hazards.length === 0) {
            return {
                success: true,
                type: 'NEARBY_HAZARDS',
                assistantMessage: 'I do not see active hazards near your current location. Keep your attention on the road.',
                speakableMessage: 'No active nearby hazards found.',
                data: { hazards: [] },
            };
        }
        const top = hazards.slice(0, 3);
        return {
            success: true,
            type: 'NEARBY_HAZARDS',
            assistantMessage: `I found ${hazards.length} active hazard${hazards.length === 1 ? '' : 's'} nearby: ` +
                top.map((h) => this.humanHazard(h.type)).join(', ') +
                '. Slow down and stay alert.',
            speakableMessage: `I found ${hazards.length} active nearby hazard${hazards.length === 1 ? '' : 's'}. Slow down and stay alert.`,
            data: { hazards },
        };
    }
    hazardDraft(request, intent) {
        if (!request.location) {
            return this.clarify('I can draft that report once location is available.');
        }
        const hazardType = this.toReportType(intent.hazardType, request.message);
        const draft = this.tools.createHazardReportDraft(hazardType, request.location.lat, request.location.lng, `Reported by AI assistant: ${this.humanHazard(hazardType)}`);
        const requireConfirmation = this.config.get('ASSISTANT_REQUIRE_CONFIRMATION', 'true') !== 'false';
        if (!requireConfirmation) {
        }
        return {
            success: true,
            type: 'HAZARD_REPORT_DRAFT',
            assistantMessage: `I detected a ${this.humanHazard(hazardType).toLowerCase()} report near your current location. Please confirm before I submit it.`,
            speakableMessage: `${this.humanHazard(hazardType)} report ready. Please confirm before I submit it.`,
            suggestedActions: [
                {
                    id: 'confirm_hazard_report',
                    label: `Submit ${this.humanHazard(hazardType).toLowerCase()} report`,
                    type: 'CONFIRM_ACTION',
                    payload: draft,
                },
                { id: 'cancel', label: 'Cancel', type: 'DISMISS' },
            ],
            data: draft,
        };
    }
    routeExplanation(request) {
        const explanation = this.tools.explainRouteChange(request.activeRouteId);
        return {
            success: true,
            type: 'ROUTE_EXPLANATION',
            assistantMessage: explanation.explanation,
            speakableMessage: explanation.explanation,
            data: explanation,
        };
    }
    async navigationDestination(request, intent) {
        if (!request.location) {
            return this.clarify('Share your location first so I can calculate a route.');
        }
        const destinationQuery = intent.destination || this.extractDestination(request.message);
        if (!destinationQuery) {
            return this.clarify('Where would you like to go?');
        }
        const destination = await this.tools.geocodeDestination(destinationQuery);
        if (!destination) {
            return this.clarify(`I could not find ${destinationQuery}. Try a more specific place name.`);
        }
        const route = await this.tools.calculateRoute({ lat: request.location.lat, lng: request.location.lng }, { lat: destination.lat, lng: destination.lng }, request.vehicleType);
        const straightLineMeters = this.distanceMeters(request.location.lat, request.location.lng, destination.lat, destination.lng);
        const routeDistanceMeters = Number(route?.distanceMeters ?? 0);
        const distanceMeters = route?.id === 'fallback_route' || routeDistanceMeters <= 0
            ? straightLineMeters
            : routeDistanceMeters;
        const durationSeconds = Number(route?.estimatedTimeSeconds ?? 0);
        const distanceLabel = distanceMeters > 0
            ? `${(distanceMeters / 1000).toFixed(1)} km`
            : 'a route';
        const durationLabel = durationSeconds > 0
            ? `${Math.max(1, Math.round(durationSeconds / 60))} min`
            : 'a few minutes';
        const asksDistance = this.isDistanceQuestion(request.message);
        const routeSummary = {
            id: route?.id,
            distanceMeters,
            estimatedTimeSeconds: durationSeconds,
            riskLevel: route?.riskLevel,
            safetyRiskScore: route?.safetyRiskScore,
        };
        return {
            success: true,
            type: 'ROUTE_EXPLANATION',
            assistantMessage: asksDistance
                ? `${destination.name} is about ${distanceLabel} from here. Driving time is around ${durationLabel}.`
                : `I found ${destination.name}. It is about ${distanceLabel} away, around ${durationLabel}.`,
            speakableMessage: asksDistance
                ? `${destination.name} is about ${distanceLabel} from here.`
                : `I found ${destination.name}. It is about ${distanceLabel} away.`,
            suggestedActions: [
                {
                    id: 'start_navigation',
                    label: `Start route to ${destination.name}`,
                    type: 'START_NAVIGATION',
                    payload: {
                        lat: destination.lat,
                        lng: destination.lng,
                        name: destination.name,
                        address: destination.address,
                        immediate: true,
                        routeSummary,
                    },
                },
            ],
            data: { destination, route: routeSummary },
        };
    }
    async safetySummary(request) {
        const summary = await this.tools.getSafetySummary(request.location?.lat, request.location?.lng, request.radiusMeters ?? 1500);
        return {
            success: true,
            type: 'SAFETY_GUIDANCE',
            assistantMessage: summary.summary,
            speakableMessage: summary.summary,
            data: summary,
        };
    }
    classifyFallback(message) {
        const text = message.toLowerCase();
        if (/(what can you do|help|commands|assist)/.test(text)) {
            return { intent: 'HELP', confidence: 0.9 };
        }
        if (/(nearby|near me|ahead).*(hazard|danger|accident|pothole|flood)|hazards near/.test(text)) {
            return { intent: 'FIND_NEARBY_HAZARDS', confidence: 0.85 };
        }
        if (/(why|explain).*(route|reroute|changed|change)|route change/.test(text)) {
            return { intent: 'EXPLAIN_ROUTE', confidence: 0.8 };
        }
        const destination = this.extractDestination(message);
        if (destination) {
            return {
                intent: 'NAVIGATION_DESTINATION',
                destination,
                confidence: 0.88,
            };
        }
        if (/(safe|safety|driving tip|guidance|careful|dangerous)/.test(text)) {
            return { intent: 'SAFETY', confidence: 0.75 };
        }
        if (/(report|submit|flag|there is|there's).*(pothole|accident|crash|flood|flooding|closure|blocked|hazard|traffic)/.test(text)) {
            return {
                intent: 'REPORT_HAZARD',
                hazardType: this.toReportType(undefined, text),
                confidence: 0.82,
            };
        }
        return { intent: 'CLARIFY', confidence: 0.4 };
    }
    shouldUseFallback(llmIntent, fallbackIntent) {
        if (!llmIntent)
            return true;
        if (llmIntent.intent === 'CLARIFY' && fallbackIntent.intent !== 'CLARIFY') {
            return true;
        }
        if (llmIntent.intent === 'NAVIGATION_DESTINATION' &&
            !llmIntent.destination &&
            fallbackIntent.intent === 'NAVIGATION_DESTINATION') {
            return true;
        }
        return false;
    }
    extractDestination(message) {
        const text = message
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\bdistanace\b/gi, 'distance')
            .replace(/\bdistnace\b/gi, 'distance')
            .replace(/\bdistence\b/gi, 'distance')
            .replace(/\bdist\b/gi, 'distance')
            .replace(/\bdirection\b/gi, 'directions');
        const patterns = [
            /^(?:take me to|navigate to|go to|drive to|route to|get me to|directions to|direct me to|guide me to|lead me to|send me to)\s+(.+)$/i,
            /^(?:show me (?:the )?way to|show route to|show directions to|show me directions to|open route to|open navigation to)\s+(.+)$/i,
            /^(?:plot (?:a )?route to|map (?:a )?route to|map directions to|find (?:a )?route to|find directions to|calculate (?:a )?route to)\s+(.+)$/i,
            /^(?:start navigation to|start route to|begin navigation to|begin route to|launch navigation to|launch route to)\s+(.+)$/i,
            /^(?:i want to go to|i need to go to|i am going to|i'm going to|i would like to go to|i wanna go to|i need directions to)\s+(.+)$/i,
            /^(?:can you take me to|can you navigate to|can you route me to|can you show me the way to|please take me to|please navigate to|please route me to)\s+(.+)$/i,
            /^(?:how about|what about|and|then|next|also try|try|check|compare with|compare to)\s+(.+)$/i,
            /^(?:how far is|distance to|distance for|distance until|distance up to)\s+(.+)$/i,
            /^(?:how far|how many\s+(?:km|kilometers?|distance))\s+(?:is\s+)?(?:it\s+)?(?:from\s+)?(?:here|my location|current location)\s+(?:to|from)\s+(.+)$/i,
            /^(?:what(?:'s| is)?\s+)?(?:the\s+)?distance\s+(?:from\s+)?(?:here|my location|current location)\s+(?:to|from)\s+(.+)$/i,
            /^(?:how far|how many\s+(?:km|kilometers?))\s+(?:away\s+)?(?:is\s+)?(.+?)\s+(?:from\s+)?(?:here|my location|current location)$/i,
            /^(?:how far|how many\s+(?:km|kilometers?))\s+(?:to|from)\s+(.+)$/i,
            /^(?:what(?:'s| is)?\s+)?(?:the\s+)?(?:eta|estimated time|travel time|drive time|driving time)\s+(?:to|for|from here to)\s+(.+)$/i,
            /^(?:how long|how much time|how many minutes|how many hours)\s+(?:does it take\s+)?(?:to get\s+)?(?:to|from here to)\s+(.+)$/i,
            /^(?:is|are)\s+(.+?)\s+(?:far|near|close)(?:\s+from\s+(?:here|me|my location|current location))?$/i,
            /^(?:nearest route to|best route to|fastest route to|safest route to|shortest route to)\s+(.+)$/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            const destination = match?.[1]?.trim().replace(/[?.!]+$/, '');
            if (destination)
                return destination;
        }
        return null;
    }
    isDistanceQuestion(message) {
        const text = message.toLowerCase();
        return /\b(distance|distanace|distnace|distence|how far|how many\s+(km|kilometers?)|eta|estimated time|travel time|drive time|driving time|how long|how much time|how many minutes|how many hours)\b/.test(text);
    }
    distanceMeters(lat1, lng1, lat2, lng2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const earthRadiusMeters = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    toReportType(value, message = '') {
        const text = `${value ?? ''} ${message}`.toLowerCase();
        if (text.includes('pothole'))
            return create_report_dto_1.ReportType.POTHOLE;
        if (text.includes('flood'))
            return create_report_dto_1.ReportType.FLOOD;
        if (text.includes('accident'))
            return create_report_dto_1.ReportType.ACCIDENT;
        if (text.includes('crash'))
            return create_report_dto_1.ReportType.CRASH;
        if (text.includes('closure') || text.includes('blocked'))
            return create_report_dto_1.ReportType.CLOSURE;
        if (text.includes('traffic'))
            return create_report_dto_1.ReportType.TRAFFIC;
        return create_report_dto_1.ReportType.HAZARD;
    }
    humanHazard(type) {
        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }
    clarify(message) {
        return {
            success: true,
            type: 'CLARIFICATION',
            assistantMessage: message,
            speakableMessage: message,
            suggestedActions: this.quickActions(),
        };
    }
    quickActions() {
        return [
            { id: 'qa_help', label: 'Help', type: 'QUICK_REPLY', payload: { message: 'What can you do?' } },
            { id: 'qa_hazards', label: 'Nearby hazards', type: 'QUICK_REPLY', payload: { message: 'Any hazards near me?' } },
            { id: 'qa_pothole', label: 'Report pothole', type: 'QUICK_REPLY', payload: { message: 'Report pothole ahead' } },
        ];
    }
};
exports.AssistantService = AssistantService;
exports.AssistantService = AssistantService = AssistantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [assistant_llm_provider_1.AssistantLlmProvider,
        assistant_tools_service_1.AssistantToolsService,
        config_1.ConfigService])
], AssistantService);
//# sourceMappingURL=assistant.service.js.map