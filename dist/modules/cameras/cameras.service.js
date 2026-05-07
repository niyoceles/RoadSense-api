"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamerasService = exports.CameraType = void 0;
const common_1 = require("@nestjs/common");
var CameraType;
(function (CameraType) {
    CameraType["FIXED"] = "fixed";
    CameraType["MOBILE"] = "mobile";
    CameraType["RED_LIGHT"] = "red_light";
})(CameraType || (exports.CameraType = CameraType = {}));
let CamerasService = class CamerasService {
    constructor() {
        this.fixedCameras = [
            {
                id: 'kigali_cam_1',
                lat: -1.9442,
                lng: 30.0620,
                type: CameraType.FIXED,
                speedLimit: 60,
                confidenceScore: 1.0,
            },
            {
                id: 'kigali_cam_2',
                lat: -1.9567,
                lng: 30.0634,
                type: CameraType.FIXED,
                speedLimit: 60,
                confidenceScore: 1.0,
            },
            {
                id: 'kigali_cam_3',
                lat: -1.9612,
                lng: 30.1245,
                type: CameraType.FIXED,
                speedLimit: 80,
                confidenceScore: 1.0,
            },
        ];
    }
    async getCamerasAlongRoute(routeLineString) {
        return this.fixedCameras;
    }
    checkApproachingCamera(currentSpeed, camera) {
        if (currentSpeed > camera.speedLimit * 1.1) {
            return `Warning! Speed camera ahead. Limit is ${camera.speedLimit} km/h. Slow down!`;
        }
        return `Speed camera reported ahead. Limit is ${camera.speedLimit} km/h.`;
    }
};
exports.CamerasService = CamerasService;
exports.CamerasService = CamerasService = __decorate([
    (0, common_1.Injectable)()
], CamerasService);
//# sourceMappingURL=cameras.service.js.map