export class UpdateDepartmentCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly description?: string | null,
    public readonly isActive?: boolean,
  ) {}
}
