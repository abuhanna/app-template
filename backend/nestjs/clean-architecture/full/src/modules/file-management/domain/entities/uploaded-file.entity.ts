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

export class UploadedFile {
  private constructor(
    public readonly id: number,
    public fileName: string,
    public originalFileName: string,
    public contentType: string,
    public fileSize: number,
    public storagePath: string,
    public description: string | null,
    public category: string | null,
    public isPublic: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: number | null,
    public updatedBy: number | null,
  ) {}

  static create(props: CreateUploadedFileProps): UploadedFile {
    const now = new Date();
    return new UploadedFile(
      0,
      props.fileName,
      props.originalFileName,
      props.contentType,
      props.fileSize,
      props.storagePath,
      props.description ?? null,
      props.category ?? null,
      props.isPublic ?? false,
      now,
      now,
      null,
      null,
    );
  }

  static reconstitute(
    id: number,
    fileName: string,
    originalFileName: string,
    contentType: string,
    fileSize: number,
    storagePath: string,
    description: string | null,
    category: string | null,
    isPublic: boolean,
    createdAt: Date,
    updatedAt: Date,
    createdBy: number | null,
    updatedBy: number | null,
  ): UploadedFile {
    return new UploadedFile(
      id,
      fileName,
      originalFileName,
      contentType,
      fileSize,
      storagePath,
      description,
      category,
      isPublic,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
    );
  }

  update(props: UpdateUploadedFileProps): void {
    if (props.description !== undefined) this.description = props.description;
    if (props.category !== undefined) this.category = props.category;
    if (props.isPublic !== undefined) this.isPublic = props.isPublic;
    this.updatedAt = new Date();
  }
}
