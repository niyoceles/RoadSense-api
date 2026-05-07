import { Module, Global } from '@nestjs/common';
import { RealTimeEventGateway } from './events.gateway';

@Global()
@Module({
  providers: [RealTimeEventGateway],
  exports: [RealTimeEventGateway],
})
export class RealTimeEventsModule {}
