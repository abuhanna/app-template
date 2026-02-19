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
var DownloadFileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadFileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const download_file_query_1 = require("./download-file.query");
const uploaded_file_repository_interface_1 = require("../../domain/interfaces/uploaded-file.repository.interface");
const file_storage_service_interface_1 = require("../../domain/interfaces/file-storage.service.interface");
let DownloadFileHandler = DownloadFileHandler_1 = class DownloadFileHandler {
    constructor(fileRepository, fileStorage) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
        this.logger = new common_1.Logger(DownloadFileHandler_1.name);
    }
    async execute(query) {
        const file = await this.fileRepository.findById(query.id);
        if (!file) {
            throw new common_1.NotFoundException(`File with ID ${query.id} not found`);
        }
        const stream = await this.fileStorage.getFile(file.storagePath);
        if (!stream) {
            this.logger.warn(`File storage not found: ${file.storagePath}`);
            throw new common_1.NotFoundException('File not found in storage');
        }
        return {
            stream,
            contentType: file.contentType,
            fileName: file.originalFileName,
        };
    }
};
exports.DownloadFileHandler = DownloadFileHandler;
exports.DownloadFileHandler = DownloadFileHandler = DownloadFileHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(download_file_query_1.DownloadFileQuery),
    __param(0, (0, common_1.Inject)(uploaded_file_repository_interface_1.IUploadedFileRepository)),
    __param(1, (0, common_1.Inject)(file_storage_service_interface_1.IFileStorageService)),
    __metadata("design:paramtypes", [Object, Object])
], DownloadFileHandler);
//# sourceMappingURL=download-file.handler.js.map