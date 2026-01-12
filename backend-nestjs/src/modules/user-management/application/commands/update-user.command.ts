import { UserRole } from '../../domain/value-objects/user-role';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly username?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly role?: UserRole,
    public readonly departmentId?: string | null,
    public readonly isActive?: boolean,
  ) {}
}
