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
exports.ChangePasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const change_password_command_1 = require("./change-password.command");
const user_repository_interface_1 = require("../../domain/interfaces/user.repository.interface");
const password_service_interface_1 = require("../../../auth/domain/interfaces/password.service.interface");
const refresh_token_repository_interface_1 = require("../../../auth/domain/interfaces/refresh-token.repository.interface");
let ChangePasswordHandler = class ChangePasswordHandler {
    constructor(userRepository, passwordService, refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async execute(command) {
        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await this.passwordService.verify(command.currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const passwordHash = await this.passwordService.hash(command.newPassword);
        user.updatePassword(passwordHash);
        await this.userRepository.save(user);
        await this.refreshTokenRepository.revokeAllByUserId(user.id);
    }
};
exports.ChangePasswordHandler = ChangePasswordHandler;
exports.ChangePasswordHandler = ChangePasswordHandler = __decorate([
    (0, cqrs_1.CommandHandler)(change_password_command_1.ChangePasswordCommand),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(password_service_interface_1.IPasswordService)),
    __param(2, (0, common_1.Inject)(refresh_token_repository_interface_1.IRefreshTokenRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChangePasswordHandler);
//# sourceMappingURL=change-password.handler.js.map