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
exports.RefreshTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const refresh_token_orm_entity_1 = require("./refresh-token.orm-entity");
const refresh_token_entity_1 = require("../../domain/entities/refresh-token.entity");
let RefreshTokenRepository = class RefreshTokenRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findByToken(token) {
        const entity = await this.repository.findOne({ where: { token } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByUserId(userId) {
        const entities = await this.repository.find({
            where: { userId: userId.toString() },
            order: { createdAt: 'DESC' },
        });
        return entities.map((entity) => this.toDomain(entity));
    }
    async save(refreshToken) {
        const entity = this.toEntity(refreshToken);
        const savedEntity = await this.repository.save(entity);
        return this.toDomain(savedEntity);
    }
    async revokeByToken(token) {
        await this.repository.update({ token }, { isRevoked: true, revokedAt: new Date() });
    }
    async revokeAllByUserId(userId) {
        await this.repository.update({ userId: userId.toString(), isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
    }
    async deleteExpired() {
        await this.repository.delete({
            expiresAt: (0, typeorm_2.LessThan)(new Date()),
        });
    }
    toDomain(entity) {
        return refresh_token_entity_1.RefreshToken.reconstitute(parseInt(entity.id, 10), parseInt(entity.userId, 10), entity.token, entity.expiresAt, entity.deviceInfo, entity.ipAddress, entity.isRevoked, entity.revokedAt, entity.replacedByToken, entity.createdAt);
    }
    toEntity(refreshToken) {
        const entity = new refresh_token_orm_entity_1.RefreshTokenOrmEntity();
        if (refreshToken.id !== 0) {
            entity.id = refreshToken.id.toString();
        }
        entity.userId = refreshToken.userId.toString();
        entity.token = refreshToken.token;
        entity.expiresAt = refreshToken.expiresAt;
        entity.deviceInfo = refreshToken.deviceInfo;
        entity.ipAddress = refreshToken.ipAddress;
        entity.isRevoked = refreshToken.isRevoked;
        entity.revokedAt = refreshToken.revokedAt;
        entity.replacedByToken = refreshToken.replacedByToken;
        entity.createdAt = refreshToken.createdAt;
        return entity;
    }
};
exports.RefreshTokenRepository = RefreshTokenRepository;
exports.RefreshTokenRepository = RefreshTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(refresh_token_orm_entity_1.RefreshTokenOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RefreshTokenRepository);
//# sourceMappingURL=refresh-token.repository.js.map