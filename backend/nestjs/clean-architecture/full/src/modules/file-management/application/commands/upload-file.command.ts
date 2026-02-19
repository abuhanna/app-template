export class UploadFileCommand {
  constructor(
    public readonly fileBuffer: Buffer,
    public readonly originalFileName: string,
    public readonly contentType: string,
    public readonly fileSize: number,
    public readonly description?: string,
    public readonly category?: string,
    public readonly isPublic?: boolean,
  ) {}
}
