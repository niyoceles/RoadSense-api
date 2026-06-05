import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoadReportsModule } from '../modules/road-reports/road-reports.module';
import { RoutingModule } from '../modules/routing/routing.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantLlmProvider } from './providers/assistant-llm.provider';
import { OllamaProvider } from './providers/ollama.provider';
import { AssistantToolsService } from './tools/assistant-tools.service';
import { GeocodingTool } from './tools/geocoding-tool';
import { HazardTool } from './tools/hazard-tool';
import { RoutingTool } from './tools/routing-tool';
import { SafetyTool } from './tools/safety-tool';

@Module({
  imports: [ConfigModule, HttpModule, RoadReportsModule, RoutingModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantToolsService,
    HazardTool,
    RoutingTool,
    GeocodingTool,
    SafetyTool,
    { provide: AssistantLlmProvider, useClass: OllamaProvider },
  ],
})
export class AssistantModule {}
