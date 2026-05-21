import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AiModule } from './modules/ai/ai.module';
import { CamerasModule } from './modules/cameras/cameras.module';
import { RealTimeEventsModule } from './modules/real-time-events/real-time-events.module';
import { RiskEngineModule } from './modules/risk-engine/risk-engine.module';
import { RoadReportsModule } from './modules/road-reports/road-reports.module';
import { RoutingModule } from './modules/routing/routing.module';
import { MapStylesModule } from './modules/map-styles/map-styles.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RoadReportsModule,
    AlertsModule,
    AiModule,
    RiskEngineModule,
    RoutingModule,
    MapStylesModule,
    CamerasModule,
    RealTimeEventsModule,
  ],
})
export class AppModule {}
