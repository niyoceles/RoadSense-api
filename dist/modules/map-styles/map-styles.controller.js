"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapStylesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const map_styles_service_1 = require("./map-styles.service");
let MapStylesController = class MapStylesController {
    constructor(mapStylesService) {
        this.mapStylesService = mapStylesService;
    }
    getStyles() {
        return this.mapStylesService.getStyleConfig();
    }
    getStyle(styleId) {
        const style = this.mapStylesService.getStyleDocument(styleId);
        if (!style) {
            throw new common_1.NotFoundException(`Unknown map style: ${styleId}`);
        }
        return style;
    }
};
exports.MapStylesController = MapStylesController;
__decorate([
    (0, common_1.Get)('map/styles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public MapLibre style configuration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MapStylesController.prototype, "getStyles", null);
__decorate([
    (0, common_1.Get)('styles/:styleId.json'),
    (0, common_1.Header)('Cache-Control', 'public, max-age=300'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a RoadSense MapLibre style document' }),
    (0, swagger_1.ApiParam)({ name: 'styleId', enum: ['default', 'satellite', 'hybrid'] }),
    __param(0, (0, common_1.Param)('styleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MapStylesController.prototype, "getStyle", null);
exports.MapStylesController = MapStylesController = __decorate([
    (0, swagger_1.ApiTags)('map-styles'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [map_styles_service_1.MapStylesService])
], MapStylesController);
//# sourceMappingURL=map-styles.controller.js.map