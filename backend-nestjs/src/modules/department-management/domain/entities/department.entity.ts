

export interface CreateDepartmentProps {
  name: string;
  code: string;
  description?: string | null;
}

export interface UpdateDepartmentProps {
  name?: string;
  code?: string;
  description?: string | null;
  isActive?: boolean;
}

export class Department {
  private constructor(
    public readonly id: number,
    public name: string,
    public code: string,
    public description: string | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: number | null,
    public updatedBy: number | null,
  ) {}

  static create(props: CreateDepartmentProps): Department {
    const now = new Date();
    return new Department(
      0,
      props.name,
      props.code.toUpperCase(),
      props.description ?? null,
      true,
      now,
      now,
      null,
      null,
    );
  }

  static reconstitute(
    id: number,
    name: string,
    code: string,
    description: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    createdBy: number | null,
    updatedBy: number | null,
  ): Department {
    return new Department(
      id,
      name,
      code,
      description,
      isActive,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
    );
  }

  update(props: UpdateDepartmentProps): void {
    if (props.name !== undefined) this.name = props.name;
    if (props.code !== undefined) this.code = props.code.toUpperCase();
    if (props.description !== undefined) this.description = props.description;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }
}
