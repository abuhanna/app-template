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
var UploadFileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const upload_file_command_1 = require("./upload-file.command");
const uploaded_file_mapper_1 = require("../mappers/uploaded-file.mapper");
const uploaded_file_entity_1 = require("../../domain/entities/uploaded-file.entity");
const uploaded_file_repository_interface_1 = require("../../domain/interfaces/uploaded-file.repository.interface");
const file_storage_service_interface_1 = require("../../domain/interfaces/file-storage.service.interface");
let UploadFileHandler = UploadFileHandler_1 = class UploadFileHandler {
    constructor(fileRepository, fileStorage) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
        this.logger = new common_1.Logger(UploadFileHandler_1.name);
    }
    async execute(command) {
        this.logger.log(`Uploading file: ${command.originalFileName}`);
        const result = await this.fileStorage.saveFile(command.fileBuffer, command.originalFileName, command.contentType);
        const uploadedFile = uploaded_file_entity_1.UploadedFile.create({
            fileName: result.fileName,
            originalFileName: command.originalFileName,
            contentType: command.contentType,
            fileSize: command.fileSize,
            storagePath: result.storagePath,
            description: command.description,
            category: command.category,
            isPublic: command.isPublic,
        });
        const savedFile = await this.fileRepository.save(uploadedFile);
        this.logger.log(`File uploaded successfully: ${command.originalFileName} (ID: ${savedFile.id})`);
        return uploaded_file_mapper_1.UploadedFileMapper.toDto(savedFile);
    }
};
exports.UploadFileHandler = UploadFileHandler;
exports.UploadFileHandler = UploadFileHandler = UploadFileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(upload_file_command_1.UploadFileCommand),
    __param(0, (0, common_1.Inject)(uploaded_file_repository_interface_1.IUploadedFileRepository)),
    __param(1, (0, common_1.Inject)(file_storage_service_interface_1.IFileStorageService)),
    __metadata("design:paramtypes", [Object, Object])
], UploadFileHandler);
//# sourceMappingURL=upload-file.handler.js.map