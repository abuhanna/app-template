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
exports.LoginHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const login_command_1 = require("./login.command");
const login_response_dto_1 = require("../dto/login-response.dto");
const user_dto_1 = require("../../../user-management/application/dto/user.dto");
const user_repository_interface_1 = require("../../../user-management/domain/interfaces/user.repository.interface");
const password_service_interface_1 = require("../../domain/interfaces/password.service.interface");
const jwt_token_service_interface_1 = require("../../domain/interfaces/jwt-token.service.interface");
const refresh_token_repository_interface_1 = require("../../domain/interfaces/refresh-token.repository.interface");
const refresh_token_entity_1 = require("../../domain/entities/refresh-token.entity");
let LoginHandler = class LoginHandler {
    constructor(userRepository, passwordService, jwtTokenService, refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async execute(command) {
        let user = await this.userRepository.findByUsername(command.username);
        if (!user) {
            user = await this.userRepository.findByEmail(command.username);
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is disabled');
        }
        const isPasswordValid = await this.passwordService.verify(command.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokenPair = await this.jwtTokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        });
        const refreshToken = refresh_token_entity_1.RefreshToken.create({
            userId: user.id,
            token: tokenPair.refreshToken,
            expiresAt: tokenPair.refreshTokenExpiresAt,
        });
        await this.refreshTokenRepository.save(refreshToken);
        user.recordLogin();
        await this.userRepository.save(user);
        const expiresIn = Math.floor((tokenPair.accessTokenExpiresAt.getTime() - Date.now()) / 1000);
        return new login_response_dto_1.LoginResponseDto(tokenPair.accessToken, tokenPair.refreshToken, expiresIn, tokenPair.refreshTokenExpiresAt, new user_dto_1.UserDto({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            departmentId: user.departmentId,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
};
exports.LoginHandler = LoginHandler;
exports.LoginHandler = LoginHandler = __decorate([
    (0, cqrs_1.CommandHandler)(login_command_1.LoginCommand),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(password_service_interface_1.IPasswordService)),
    __param(2, (0, common_1.Inject)(jwt_token_service_interface_1.IJwtTokenService)),
    __param(3, (0, common_1.Inject)(refresh_token_repository_interface_1.IRefreshTokenRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], LoginHandler);
//# sourceMappingURL=login.handler.js.map