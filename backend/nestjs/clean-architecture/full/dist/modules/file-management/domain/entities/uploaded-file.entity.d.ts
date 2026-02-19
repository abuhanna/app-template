export interface CreateUploadedFileProps {
    fileName: string;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    storagePath: string;
    description?: string | null;
    category?: string | null;
    isPublic?: boolean;
}
export interface UpdateUploadedFileProps {
    description?: string | null;
    category?: string | null;
    isPublic?: boolean;
}
export declare class UploadedFile {
    readonly id: number;
    fileName: string;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    storagePath: string;
    description: string | null;
    category: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number | null;
    updatedBy: number | null;
    private constructor();
    static create(props: CreateUploadedFileProps): UploadedFile;
    static reconstitute(id: number, fileName: string, originalFileName: string, contentType: string, fileSize: number, storagePath: string, description: string | null, category: string | null, isPublic: boolean, createdAt: Date, updatedAt: Date, createdBy: number | null, updatedBy: number | null): UploadedFile;
    update(props: UpdateUploadedFileProps): void;
}
