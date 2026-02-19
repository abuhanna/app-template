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
exports.JwtTokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
let JwtTokenService = class JwtTokenService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async generateTokens(payload) {
        const accessTokenExpiresIn = this.configService.get('JWT_EXPIRES_IN', '15m');
        const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: accessTokenExpiresIn,
        });
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: refreshTokenExpiresIn,
        });
        const accessTokenExpiresAt = this.calculateExpiryDate(accessTokenExpiresIn);
        const refreshTokenExpiresAt = this.calculateExpiryDate(refreshTokenExpiresIn);
        return {
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
        };
    }
    async verifyAccessToken(token) {
        return this.jwtService.verify(token);
    }
    async verifyRefreshToken(token) {
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
        return this.jwtService.verify(token, { secret: refreshSecret });
    }
    generatePasswordResetToken() {
        return (0, uuid_1.v4)().replace(/-/g, '');
    }
    calculateExpiryDate(expiresIn) {
        const now = Date.now();
        let ms = 0;
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            switch (unit) {
                case 's':
                    ms = value * 1000;
                    break;
                case 'm':
                    ms = value * 60 * 1000;
                    break;
                case 'h':
                    ms = value * 60 * 60 * 1000;
                    break;
                case 'd':
                    ms = value * 24 * 60 * 60 * 1000;
                    break;
            }
        }
        return new Date(now + ms);
    }
};
exports.JwtTokenService = JwtTokenService;
exports.JwtTokenService = JwtTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], JwtTokenService);
//# sourceMappingURL=jwt-token.service.js.map