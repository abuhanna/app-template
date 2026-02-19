export declare class UploadedFileDto {
    id: number;
    fileName: string;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    description: string | null;
    category: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number | null;
    downloadUrl: string;
}
