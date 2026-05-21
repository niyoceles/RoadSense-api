"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapStylesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const map_styles_controller_1 = require("./map-styles.controller");
const map_styles_service_1 = require("./map-styles.service");
let MapStylesModule = class MapStylesModule {
};
exports.MapStylesModule = MapStylesModule;
exports.MapStylesModule = MapStylesModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [map_styles_controller_1.MapStylesController],
        providers: [map_styles_service_1.MapStylesService],
    })
], MapStylesModule);
//# sourceMappingURL=map-styles.module.js.map