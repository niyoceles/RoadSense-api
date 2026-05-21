"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const ai_module_1 = require("./modules/ai/ai.module");
const cameras_module_1 = require("./modules/cameras/cameras.module");
const real_time_events_module_1 = require("./modules/real-time-events/real-time-events.module");
const risk_engine_module_1 = require("./modules/risk-engine/risk-engine.module");
const road_reports_module_1 = require("./modules/road-reports/road-reports.module");
const routing_module_1 = require("./modules/routing/routing.module");
const map_styles_module_1 = require("./modules/map-styles/map-styles.module");
const database_module_1 = require("./modules/database/database.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            road_reports_module_1.RoadReportsModule,
            alerts_module_1.AlertsModule,
            ai_module_1.AiModule,
            risk_engine_module_1.RiskEngineModule,
            routing_module_1.RoutingModule,
            map_styles_module_1.MapStylesModule,
            cameras_module_1.CamerasModule,
            real_time_events_module_1.RealTimeEventsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map