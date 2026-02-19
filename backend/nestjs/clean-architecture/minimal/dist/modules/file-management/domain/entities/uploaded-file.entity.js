"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadedFile = void 0;
class UploadedFile {
    constructor(id, fileName, originalFileName, contentType, fileSize, storagePath, description, category, isPublic, createdAt, updatedAt, createdBy, updatedBy) {
        this.id = id;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.storagePath = storagePath;
        this.description = description;
        this.category = category;
        this.isPublic = isPublic;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
    static create(props) {
        const now = new Date();
        return new UploadedFile(0, props.fileName, props.originalFileName, props.contentType, props.fileSize, props.storagePath, props.description ?? null, props.category ?? null, props.isPublic ?? false, now, now, null, null);
    }
    static reconstitute(id, fileName, originalFileName, contentType, fileSize, storagePath, description, category, isPublic, createdAt, updatedAt, createdBy, updatedBy) {
        return new UploadedFile(id, fileName, originalFileName, contentType, fileSize, storagePath, description, category, isPublic, createdAt, updatedAt, createdBy, updatedBy);
    }
    update(props) {
        if (props.description !== undefined)
            this.description = props.description;
        if (props.category !== undefined)
            this.category = props.category;
        if (props.isPublic !== undefined)
            this.isPublic = props.isPublic;
        this.updatedAt = new Date();
    }
}
exports.UploadedFile = UploadedFile;
//# sourceMappingURL=uploaded-file.entity.js.map