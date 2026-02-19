"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileCommand = void 0;
class UploadFileCommand {
    constructor(fileBuffer, originalFileName, contentType, fileSize, description, category, isPublic) {
        this.fileBuffer = fileBuffer;
        this.originalFileName = originalFileName;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.description = description;
        this.category = category;
        this.isPublic = isPublic;
    }
}
exports.UploadFileCommand = UploadFileCommand;
//# sourceMappingURL=upload-file.command.js.map