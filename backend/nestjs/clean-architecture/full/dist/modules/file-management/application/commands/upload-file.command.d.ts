export declare class UploadFileCommand {
    readonly fileBuffer: Buffer;
    readonly originalFileName: string;
    readonly contentType: string;
    readonly fileSize: number;
    readonly description?: string | undefined;
    readonly category?: string | undefined;
    readonly isPublic?: boolean | undefined;
    constructor(fileBuffer: Buffer, originalFileName: string, contentType: string, fileSize: number, description?: string | undefined, category?: string | undefined, isPublic?: boolean | undefined);
}
