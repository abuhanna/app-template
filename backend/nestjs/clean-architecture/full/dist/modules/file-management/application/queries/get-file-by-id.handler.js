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
exports.GetFileByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_file_by_id_query_1 = require("./get-file-by-id.query");
const uploaded_file_mapper_1 = require("../mappers/uploaded-file.mapper");
const uploaded_file_repository_interface_1 = require("../../domain/interfaces/uploaded-file.repository.interface");
let GetFileByIdHandler = class GetFileByIdHandler {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }
    async execute(query) {
        const file = await this.fileRepository.findById(query.id);
        if (!file) {
            throw new common_1.NotFoundException(`File with ID ${query.id} not found`);
        }
        return uploaded_file_mapper_1.UploadedFileMapper.toDto(file);
    }
};
exports.GetFileByIdHandler = GetFileByIdHandler;
exports.GetFileByIdHandler = GetFileByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_file_by_id_query_1.GetFileByIdQuery),
    __param(0, (0, common_1.Inject)(uploaded_file_repository_interface_1.IUploadedFileRepository)),
    __metadata("design:paramtypes", [Object])
], GetFileByIdHandler);
//# sourceMappingURL=get-file-by-id.handler.js.map