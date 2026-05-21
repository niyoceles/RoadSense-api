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
exports.RoadReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_report_dto_1 = require("./dto/create-report.dto");
const road_reports_service_1 = require("./road-reports.service");
let RoadReportsController = class RoadReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async create(createReportDto) {
        return this.reportsService.create(createReportDto);
    }
    async findAll(includeInactive) {
        return this.reportsService.findAll(includeInactive === 'true');
    }
    async findNearby(lat, lng, radius, limit) {
        return this.reportsService.findNearby(Number(lat), Number(lng), Number(radius), Number(limit));
    }
    async findNearRoute(body) {
        return this.reportsService.findNearRoute(body.route || [], Number(body.corridorMeters), Number(body.limit));
    }
    async confirm(id, body) {
        return this.reportsService.confirm(id, body);
    }
    async dismissPost(id, body) {
        return this.reportsService.dismiss(id, body);
    }
    async verify(id) {
        return this.reportsService.verify(id);
    }
    async dismiss(id) {
        return this.reportsService.dismiss(id, {});
    }
    async reject(id, body) {
        return this.reportsService.reject(id, body?.reason);
    }
    async expire(id) {
        return this.reportsService.expire(id);
    }
    async delete(id) {
        return this.reportsService.delete(id);
    }
};
exports.RoadReportsController = RoadReportsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new road report' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_dto_1.CreateReportDto]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all road reports' }),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reports within a radius' }),
    (0, swagger_1.ApiQuery)({ name: 'lat', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'lng', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'radius', type: Number, description: 'Radius in meters' }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Post)('route'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active reports near a route polyline' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "findNearRoute", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a road report is still present' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/dismiss'),
    (0, swagger_1.ApiOperation)({ summary: 'Dismiss a road report as not present' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "dismissPost", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a road report' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "verify", null);
__decorate([
    (0, common_1.Patch)(':id/dismiss'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a road report as not currently present' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "dismiss", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a road report' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)(':id/expire'),
    (0, swagger_1.ApiOperation)({ summary: 'Expire a road report' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "expire", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a road report' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoadReportsController.prototype, "delete", null);
exports.RoadReportsController = RoadReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [road_reports_service_1.RoadReportsService])
], RoadReportsController);
//# sourceMappingURL=road-reports.controller.js.map