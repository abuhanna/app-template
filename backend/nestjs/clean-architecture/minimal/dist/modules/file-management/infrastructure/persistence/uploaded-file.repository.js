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
exports.UploadedFileRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uploaded_file_orm_entity_1 = require("./uploaded-file.orm-entity");
const uploaded_file_entity_1 = require("../../domain/entities/uploaded-file.entity");
let UploadedFileRepository = class UploadedFileRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findById(id) {
        const entity = await this.repository.findOne({ where: { id: String(id) } });
        return entity ? this.toDomain(entity) : null;
    }
    async findByFilters(options) {
        const { category, isPublic, page = 1, pageSize = 20 } = options;
        const queryBuilder = this.repository.createQueryBuilder('file');
        if (category) {
            queryBuilder.andWhere('file.category = :category', { category });
        }
        if (isPublic !== undefined) {
            queryBuilder.andWhere('file.isPublic = :isPublic', { isPublic });
        }
        queryBuilder
            .orderBy('file.createdAt', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);
        const [entities, total] = await queryBuilder.getManyAndCount();
        return {
            data: entities.map((e) => this.toDomain(e)),
            total,
        };
    }
    async save(file) {
        const entity = this.toEntity(file);
        const saved = await this.repository.save(entity);
        return this.toDomain(saved);
    }
    async delete(id) {
        await this.repository.delete(String(id));
    }
    toDomain(entity) {
        return uploaded_file_entity_1.UploadedFile.reconstitute(Number(entity.id), entity.fileName, entity.originalFileName, entity.contentType, Number(entity.fileSize), entity.storagePath, entity.description, entity.category, entity.isPublic, entity.createdAt, entity.updatedAt, entity.createdBy ? Number(entity.createdBy) : null, entity.updatedBy ? Number(entity.updatedBy) : null);
    }
    toEntity(domain) {
        const entity = new uploaded_file_orm_entity_1.UploadedFileOrmEntity();
        if (domain.id > 0) {
            entity.id = String(domain.id);
        }
        entity.fileName = domain.fileName;
        entity.originalFileName = domain.originalFileName;
        entity.contentType = domain.contentType;
        entity.fileSize = String(domain.fileSize);
        entity.storagePath = domain.storagePath;
        entity.description = domain.description;
        entity.category = domain.category;
        entity.isPublic = domain.isPublic;
        entity.createdBy = domain.createdBy ? String(domain.createdBy) : null;
        entity.updatedBy = domain.updatedBy ? String(domain.updatedBy) : null;
        return entity;
    }
};
exports.UploadedFileRepository = UploadedFileRepository;
exports.UploadedFileRepository = UploadedFileRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(uploaded_file_orm_entity_1.UploadedFileOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UploadedFileRepository);
//# sourceMappingURL=uploaded-file.repository.js.map