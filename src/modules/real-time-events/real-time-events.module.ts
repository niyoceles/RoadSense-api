import { Module, Global } from '@nestjs/common';
import { RiskEngineModule } from '../risk-engine/risk-engine.module';
import { RealTimeEventGateway } from './events.gateway';

@Global()
@Module({
  imports: [RiskEngineModule],
  providers: [RealTimeEventGateway],
  exports: [RealTimeEventGateway],
})
export class RealTimeEventsModule {}
