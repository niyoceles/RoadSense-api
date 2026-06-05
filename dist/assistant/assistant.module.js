"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const road_reports_module_1 = require("../modules/road-reports/road-reports.module");
const routing_module_1 = require("../modules/routing/routing.module");
const assistant_controller_1 = require("./assistant.controller");
const assistant_service_1 = require("./assistant.service");
const assistant_llm_provider_1 = require("./providers/assistant-llm.provider");
const ollama_provider_1 = require("./providers/ollama.provider");
const assistant_tools_service_1 = require("./tools/assistant-tools.service");
const geocoding_tool_1 = require("./tools/geocoding-tool");
const hazard_tool_1 = require("./tools/hazard-tool");
const routing_tool_1 = require("./tools/routing-tool");
const safety_tool_1 = require("./tools/safety-tool");
let AssistantModule = class AssistantModule {
};
exports.AssistantModule = AssistantModule;
exports.AssistantModule = AssistantModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, axios_1.HttpModule, road_reports_module_1.RoadReportsModule, routing_module_1.RoutingModule],
        controllers: [assistant_controller_1.AssistantController],
        providers: [
            assistant_service_1.AssistantService,
            assistant_tools_service_1.AssistantToolsService,
            hazard_tool_1.HazardTool,
            routing_tool_1.RoutingTool,
            geocoding_tool_1.GeocodingTool,
            safety_tool_1.SafetyTool,
            { provide: assistant_llm_provider_1.AssistantLlmProvider, useClass: ollama_provider_1.OllamaProvider },
        ],
    })
], AssistantModule);
//# sourceMappingURL=assistant.module.js.map