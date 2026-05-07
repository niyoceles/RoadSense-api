import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { TrafficController } from './traffic.controller';
import { TrafficEngineService } from './traffic-engine.service';

@Module({
  controllers: [TrafficController],
  providers: [RiskEngineService, TrafficEngineService],
  exports: [RiskEngineService, TrafficEngineService],
})
export class RiskEngineModule {}
