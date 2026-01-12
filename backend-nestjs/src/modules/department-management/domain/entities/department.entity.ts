import { v4 as uuidv4 } from 'uuid';

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
    public readonly id: string,
    public name: string,
    public code: string,
    public description: string | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: string | null,
    public updatedBy: string | null,
  ) {}

  static create(props: CreateDepartmentProps): Department {
    const now = new Date();
    return new Department(
      uuidv4(),
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
    id: string,
    name: string,
    code: string,
    description: string | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    createdBy: string | null,
    updatedBy: string | null,
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
