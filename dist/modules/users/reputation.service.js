"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationService = void 0;
const common_1 = require("@nestjs/common");
let ReputationService = class ReputationService {
    calculateReportConfidence(userScore, verificationCount, reportAgeMinutes) {
        const baseConfidence = (userScore / 1000) * 0.5;
        const verificationBoost = Math.min(verificationCount * 0.1, 0.5);
        const decayFactor = Math.max(1 - (reportAgeMinutes / 60), 0.1);
        return (baseConfidence + verificationBoost) * decayFactor;
    }
    updateUserReputation(currentScore, isAccurate) {
        const change = isAccurate ? 10 : -25;
        return Math.min(Math.max(currentScore + change, 0), 1000);
    }
};
exports.ReputationService = ReputationService;
exports.ReputationService = ReputationService = __decorate([
    (0, common_1.Injectable)()
], ReputationService);
//# sourceMappingURL=reputation.service.js.map