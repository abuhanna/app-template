export class GetFilesQuery {
  constructor(
    public readonly category?: string,
    public readonly isPublic?: boolean,
    public readonly page?: number,
    public readonly pageSize?: number,
  ) {}
}
