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
exports.CamerasController = void 0;
const common_1 = require("@nestjs/common");
const cameras_service_1 = require("./cameras.service");
let CamerasController = class CamerasController {
    constructor(camerasService) {
        this.camerasService = camerasService;
    }
    async getNearbyCameras(lat, lng, radius = 5000) {
        return this.camerasService.getNearbyCameras(Number(lat), Number(lng), Number(radius));
    }
};
exports.CamerasController = CamerasController;
__decorate([
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], CamerasController.prototype, "getNearbyCameras", null);
exports.CamerasController = CamerasController = __decorate([
    (0, common_1.Controller)('cameras'),
    __metadata("design:paramtypes", [cameras_service_1.CamerasService])
], CamerasController);
//# sourceMappingURL=cameras.controller.js.map