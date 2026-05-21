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
exports.CreateReportDto = exports.Severity = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
var ReportType;
(function (ReportType) {
    ReportType["TRAFFIC"] = "traffic";
    ReportType["POLICE"] = "police";
    ReportType["CRASH"] = "crash";
    ReportType["HAZARD"] = "hazard";
    ReportType["FLOOD"] = "flood";
    ReportType["CLOSURE"] = "closure";
    ReportType["POTHOLE"] = "pothole";
    ReportType["BAD_ROAD"] = "bad_road";
    ReportType["ACCIDENT"] = "accident";
    ReportType["SPEED_CAMERA"] = "speed_camera";
})(ReportType || (exports.ReportType = ReportType = {}));
var Severity;
(function (Severity) {
    Severity["LOW"] = "low";
    Severity["MEDIUM"] = "medium";
    Severity["HIGH"] = "high";
    Severity["CRITICAL"] = "critical";
})(Severity || (exports.Severity = Severity = {}));
class CreateReportDto {
}
exports.CreateReportDto = CreateReportDto;
__decorate([
    (0, class_validator_1.IsEnum)(ReportType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Severity),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "speedLimit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "directionDegrees", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "roadSegmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "cameraType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "reportedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "source", void 0);
//# sourceMappingURL=create-report.dto.js.map