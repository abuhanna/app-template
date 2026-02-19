"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManagementModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const uploaded_file_repository_interface_1 = require("./domain/interfaces/uploaded-file.repository.interface");
const file_storage_service_interface_1 = require("./domain/interfaces/file-storage.service.interface");
const commands_1 = require("./application/commands");
const queries_1 = require("./application/queries");
const uploaded_file_orm_entity_1 = require("./infrastructure/persistence/uploaded-file.orm-entity");
const uploaded_file_repository_1 = require("./infrastructure/persistence/uploaded-file.repository");
const file_storage_service_1 = require("./infrastructure/services/file-storage.service");
const files_controller_1 = require("./presentation/files.controller");
const CommandHandlers = [commands_1.UploadFileHandler, commands_1.DeleteFileHandler];
const QueryHandlers = [queries_1.GetFilesHandler, queries_1.GetFileByIdHandler, queries_1.DownloadFileHandler];
let FileManagementModule = class FileManagementModule {
};
exports.FileManagementModule = FileManagementModule;
exports.FileManagementModule = FileManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            typeorm_1.TypeOrmModule.forFeature([uploaded_file_orm_entity_1.UploadedFileOrmEntity]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: {
                    fileSize: 50 * 1024 * 1024,
                },
            }),
        ],
        controllers: [files_controller_1.FilesController],
        providers: [
            ...CommandHandlers,
            ...QueryHandlers,
            {
                provide: uploaded_file_repository_interface_1.IUploadedFileRepository,
                useClass: uploaded_file_repository_1.UploadedFileRepository,
            },
            {
                provide: file_storage_service_interface_1.IFileStorageService,
                useClass: file_storage_service_1.FileStorageService,
            },
        ],
        exports: [uploaded_file_repository_interface_1.IUploadedFileRepository, file_storage_service_interface_1.IFileStorageService],
    })
], FileManagementModule);
//# sourceMappingURL=file-management.module.js.map