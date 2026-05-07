"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = exports.ActionType = void 0;
const common_1 = require("@nestjs/common");
var ActionType;
(function (ActionType) {
    ActionType["REPORT_HAZARD"] = "report_hazard";
    ActionType["REPORT_CAMERA"] = "report_camera";
    ActionType["VERIFY_REPORT"] = "verify_report";
    ActionType["DRIVE_KM"] = "drive_km";
})(ActionType || (exports.ActionType = ActionType = {}));
let GamificationService = class GamificationService {
    constructor() {
        this.POINTS_MAP = {
            [ActionType.REPORT_HAZARD]: 10,
            [ActionType.REPORT_CAMERA]: 15,
            [ActionType.VERIFY_REPORT]: 5,
            [ActionType.DRIVE_KM]: 1,
        };
    }
    awardPoints(userId, action) {
        const pointsGained = this.POINTS_MAP[action] || 0;
        let currentTotal = 450;
        currentTotal += pointsGained;
        return {
            pointsGained,
            totalPoints: currentTotal,
            newRank: this.calculateRank(currentTotal)
        };
    }
    calculateRank(totalPoints) {
        if (totalPoints < 100)
            return 'Rookie Driver';
        if (totalPoints < 500)
            return 'Road Scout';
        if (totalPoints < 2000)
            return 'Nav Knight';
        return 'RoadSense Royalty';
    }
};
exports.GamificationService = GamificationService;
exports.GamificationService = GamificationService = __decorate([
    (0, common_1.Injectable)()
], GamificationService);
//# sourceMappingURL=gamification.service.js.map