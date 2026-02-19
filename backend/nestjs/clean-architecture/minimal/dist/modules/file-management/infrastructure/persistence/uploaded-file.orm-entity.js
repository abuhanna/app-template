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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadedFileOrmEntity = void 0;
const typeorm_1 = require("typeorm");
let UploadedFileOrmEntity = class UploadedFileOrmEntity {
};
exports.UploadedFileOrmEntity = UploadedFileOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], UploadedFileOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name', unique: true }),
    __metadata("design:type", String)
], UploadedFileOrmEntity.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_file_name' }),
    __metadata("design:type", String)
], UploadedFileOrmEntity.prototype, "originalFileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content_type' }),
    __metadata("design:type", String)
], UploadedFileOrmEntity.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size', type: 'bigint' }),
    __metadata("design:type", String)
], UploadedFileOrmEntity.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'storage_path' }),
    __metadata("design:type", String)
], UploadedFileOrmEntity.prototype, "storagePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], UploadedFileOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], UploadedFileOrmEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: false }),
    __metadata("design:type", Boolean)
], UploadedFileOrmEntity.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UploadedFileOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], UploadedFileOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'created_by', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], UploadedFileOrmEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], UploadedFileOrmEntity.prototype, "updatedBy", void 0);
exports.UploadedFileOrmEntity = UploadedFileOrmEntity = __decorate([
    (0, typeorm_1.Entity)('uploaded_files')
], UploadedFileOrmEntity);
//# sourceMappingURL=uploaded-file.orm-entity.js.map