import { Module } from '@nestjs/common';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';
import { RiskEngineModule } from '../risk-engine/risk-engine.module';

@Module({
  imports: [RiskEngineModule], // Import RiskEngine for RQI and Traffic calculation
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
