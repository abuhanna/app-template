import { UserRole } from '../../domain/value-objects/user-role';

export class UpdateUserCommand {
  constructor(
    public readonly id: number,
    public readonly email?: string,
    public readonly username?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly role?: UserRole,
    public readonly departmentId?: number | null,
    public readonly isActive?: boolean,
  ) {}
}
