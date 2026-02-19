"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadedFileMapper = void 0;
class UploadedFileMapper {
    static toDto(file) {
        return {
            id: file.id,
            fileName: file.fileName,
            originalFileName: file.originalFileName,
            contentType: file.contentType,
            fileSize: file.fileSize,
            description: file.description,
            category: file.category,
            isPublic: file.isPublic,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            createdBy: file.createdBy,
            downloadUrl: `/api/files/${file.id}/download`,
        };
    }
}
exports.UploadedFileMapper = UploadedFileMapper;
//# sourceMappingURL=uploaded-file.mapper.js.map