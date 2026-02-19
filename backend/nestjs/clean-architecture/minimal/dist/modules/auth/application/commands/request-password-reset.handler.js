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
var RequestPasswordResetHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestPasswordResetHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const request_password_reset_command_1 = require("./request-password-reset.command");
const user_repository_interface_1 = require("../../../user-management/domain/interfaces/user.repository.interface");
const jwt_token_service_interface_1 = require("../../domain/interfaces/jwt-token.service.interface");
const email_service_interface_1 = require("../../domain/interfaces/email.service.interface");
let RequestPasswordResetHandler = RequestPasswordResetHandler_1 = class RequestPasswordResetHandler {
    constructor(userRepository, jwtTokenService, emailService) {
        this.userRepository = userRepository;
        this.jwtTokenService = jwtTokenService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(RequestPasswordResetHandler_1.name);
    }
    async execute(command) {
        const user = await this.userRepository.findByEmail(command.email);
        if (!user || !user.isActive) {
            this.logger.log(`Password reset requested for non-existent/inactive email: ${command.email}`);
            return;
        }
        const resetToken = this.jwtTokenService.generatePasswordResetToken();
        user.setPasswordResetToken(resetToken, 24);
        await this.userRepository.save(user);
        try {
            await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.fullName);
            this.logger.log(`Password reset email sent to ${user.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${user.email}`, error);
        }
    }
};
exports.RequestPasswordResetHandler = RequestPasswordResetHandler;
exports.RequestPasswordResetHandler = RequestPasswordResetHandler = RequestPasswordResetHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(request_password_reset_command_1.RequestPasswordResetCommand),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(jwt_token_service_interface_1.IJwtTokenService)),
    __param(2, (0, common_1.Inject)(email_service_interface_1.IEmailService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], RequestPasswordResetHandler);
//# sourceMappingURL=request-password-reset.handler.js.map