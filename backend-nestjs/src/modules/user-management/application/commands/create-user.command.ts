import { UserRole } from '../../domain/value-objects/user-role';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole,
    public readonly departmentId?: string,
  ) {}
}
