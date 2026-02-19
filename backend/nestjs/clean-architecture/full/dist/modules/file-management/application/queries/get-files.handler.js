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
exports.GetFilesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_files_query_1 = require("./get-files.query");
const uploaded_file_mapper_1 = require("../mappers/uploaded-file.mapper");
const uploaded_file_repository_interface_1 = require("../../domain/interfaces/uploaded-file.repository.interface");
let GetFilesHandler = class GetFilesHandler {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }
    async execute(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const result = await this.fileRepository.findByFilters({
            category: query.category,
            isPublic: query.isPublic,
            page,
            pageSize,
        });
        return {
            data: result.data.map(uploaded_file_mapper_1.UploadedFileMapper.toDto),
            total: result.total,
            page,
            pageSize,
            totalPages: Math.ceil(result.total / pageSize),
        };
    }
};
exports.GetFilesHandler = GetFilesHandler;
exports.GetFilesHandler = GetFilesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_files_query_1.GetFilesQuery),
    __param(0, (0, common_1.Inject)(uploaded_file_repository_interface_1.IUploadedFileRepository)),
    __metadata("design:paramtypes", [Object])
], GetFilesHandler);
//# sourceMappingURL=get-files.handler.js.map