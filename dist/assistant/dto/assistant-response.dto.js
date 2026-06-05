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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantResponseDto = exports.ConfirmAssistantActionDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const hazard_report_intent_dto_1 = require("./hazard-report-intent.dto");
class ConfirmAssistantActionDto {
}
exports.ConfirmAssistantActionDto = ConfirmAssistantActionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['confirm_hazard_report']),
    __metadata("design:type", String)
], ConfirmAssistantActionDto.prototype, "actionId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => hazard_report_intent_dto_1.HazardReportIntentDto),
    __metadata("design:type", hazard_report_intent_dto_1.HazardReportIntentDto)
], ConfirmAssistantActionDto.prototype, "payload", void 0);
class AssistantResponseDto {
}
exports.AssistantResponseDto = AssistantResponseDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AssistantResponseDto.prototype, "data", void 0);
//# sourceMappingURL=assistant-response.dto.js.map