export declare class UploadedFileOrmEntity {
    id: string;
    fileName: string;
    originalFileName: string;
    contentType: string;
    fileSize: string;
    storagePath: string;
    description: string | null;
    category: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
}
