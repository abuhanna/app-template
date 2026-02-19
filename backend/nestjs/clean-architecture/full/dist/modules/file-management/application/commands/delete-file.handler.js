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
var DeleteFileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_file_command_1 = require("./delete-file.command");
const uploaded_file_repository_interface_1 = require("../../domain/interfaces/uploaded-file.repository.interface");
const file_storage_service_interface_1 = require("../../domain/interfaces/file-storage.service.interface");
let DeleteFileHandler = DeleteFileHandler_1 = class DeleteFileHandler {
    constructor(fileRepository, fileStorage) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
        this.logger = new common_1.Logger(DeleteFileHandler_1.name);
    }
    async execute(command) {
        this.logger.log(`Deleting file with ID: ${command.id}`);
        const file = await this.fileRepository.findById(command.id);
        if (!file) {
            throw new common_1.NotFoundException(`File with ID ${command.id} not found`);
        }
        await this.fileStorage.deleteFile(file.storagePath);
        await this.fileRepository.delete(command.id);
        this.logger.log(`File deleted successfully: ${command.id}`);
    }
};
exports.DeleteFileHandler = DeleteFileHandler;
exports.DeleteFileHandler = DeleteFileHandler = DeleteFileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_file_command_1.DeleteFileCommand),
    __param(0, (0, common_1.Inject)(uploaded_file_repository_interface_1.IUploadedFileRepository)),
    __param(1, (0, common_1.Inject)(file_storage_service_interface_1.IFileStorageService)),
    __metadata("design:paramtypes", [Object, Object])
], DeleteFileHandler);
//# sourceMappingURL=delete-file.handler.js.map