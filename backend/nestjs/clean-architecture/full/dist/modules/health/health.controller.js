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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let HealthController = class HealthController {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    health() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            application: 'AppTemplate API',
            version: '1.0.0',
        };
    }
    async ready() {
        try {
            await this.dataSource.query('SELECT 1');
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
                database: 'connected',
            };
        }
        catch {
            throw new common_1.HttpException({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
    live() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Basic health check',
        description: 'Returns the health status of the application',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, swagger_1.ApiOperation)({
        summary: 'Readiness check',
        description: 'Checks if the application is ready to accept traffic (database connected)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is ready' }),
    (0, swagger_1.ApiResponse)({
        status: 503,
        description: 'Application is not ready (dependencies unavailable)',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, swagger_1.ApiOperation)({
        summary: 'Liveness check',
        description: 'Checks if the application is alive (always returns 200 if responding)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is alive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "live", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    (0, swagger_1.ApiTags)('Health'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], HealthController);
//# sourceMappingURL=health.controller.js.map