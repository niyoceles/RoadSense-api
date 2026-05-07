import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { TrafficEngineService } from './traffic-engine.service';

@Module({
  providers: [RiskEngineService, TrafficEngineService],
  exports: [RiskEngineService, TrafficEngineService],
})
export class RiskEngineModule {}
