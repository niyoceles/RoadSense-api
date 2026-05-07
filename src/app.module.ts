import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { RoadReportsModule } from './modules/road-reports/road-reports.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { RiskEngineModule } from './modules/risk-engine/risk-engine.module';
import { RoutingModule } from './modules/routing/routing.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { RealTimeEventsModule } from './modules/real-time-events/real-time-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    RoadReportsModule,
    AlertsModule,
    RiskEngineModule,
    RoutingModule,
    CamerasModule,
    RealTimeEventsModule,
  ],
})
export class AppModule {}
