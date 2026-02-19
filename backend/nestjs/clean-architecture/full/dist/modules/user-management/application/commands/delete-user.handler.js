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
exports.DeleteUserHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_user_command_1 = require("./delete-user.command");
const user_repository_interface_1 = require("../../domain/interfaces/user.repository.interface");
let DeleteUserHandler = class DeleteUserHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(command) {
        const user = await this.userRepository.findById(command.id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.userRepository.delete(command.id);
    }
};
exports.DeleteUserHandler = DeleteUserHandler;
exports.DeleteUserHandler = DeleteUserHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_user_command_1.DeleteUserCommand),
    __param(0, (0, common_1.Inject)(user_repository_interface_1.IUserRepository)),
    __metadata("design:paramtypes", [Object])
], DeleteUserHandler);
//# sourceMappingURL=delete-user.handler.js.map