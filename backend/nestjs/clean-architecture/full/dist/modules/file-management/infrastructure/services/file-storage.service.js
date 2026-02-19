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
var FileStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
let FileStorageService = FileStorageService_1 = class FileStorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FileStorageService_1.name);
        this.storagePath = this.configService.get('FILE_STORAGE_PATH') || './uploads';
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
            this.logger.log(`Created upload directory: ${this.storagePath}`);
        }
    }
    async saveFile(fileBuffer, originalFileName, contentType) {
        const ext = path.extname(originalFileName);
        const uniqueFileName = `${(0, uuid_1.v4)()}${ext}`;
        const now = new Date();
        const subFolder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
        const folderPath = path.join(this.storagePath, subFolder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        const filePath = path.join(folderPath, uniqueFileName);
        const storagePath = `${subFolder}/${uniqueFileName}`;
        await fs.promises.writeFile(filePath, fileBuffer);
        this.logger.log(`File saved: ${originalFileName} -> ${storagePath}`);
        return { fileName: uniqueFileName, storagePath };
    }
    async getFile(storagePath) {
        const fullPath = path.join(this.storagePath, storagePath);
        if (!fs.existsSync(fullPath)) {
            this.logger.warn(`File not found: ${storagePath}`);
            return null;
        }
        return fs.createReadStream(fullPath);
    }
    async deleteFile(storagePath) {
        const fullPath = path.join(this.storagePath, storagePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            this.logger.log(`File deleted: ${storagePath}`);
        }
        else {
            this.logger.warn(`File not found for deletion: ${storagePath}`);
        }
    }
    fileExists(storagePath) {
        const fullPath = path.join(this.storagePath, storagePath);
        return fs.existsSync(fullPath);
    }
};
exports.FileStorageService = FileStorageService;
exports.FileStorageService = FileStorageService = FileStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileStorageService);
//# sourceMappingURL=file-storage.service.js.map