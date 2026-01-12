import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../value-objects/user-role';

export interface CreateUserProps {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string | null;
}

export interface UpdateUserProps {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  departmentId?: string | null;
  isActive?: boolean;
}

export class User {
  private constructor(
    public readonly id: string,
    public email: string,
    public username: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public departmentId: string | null,
    public isActive: boolean,
    public lastLoginAt: Date | null,
    public passwordResetToken: string | null,
    public passwordResetTokenExpiresAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: string | null,
    public updatedBy: string | null,
  ) {}

  static create(props: CreateUserProps): User {
    const now = new Date();
    return new User(
      uuidv4(),
      props.email,
      props.username,
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.role,
      props.departmentId ?? null,
      true,
      null,
      null,
      null,
      now,
      now,
      null,
      null,
    );
  }

  static reconstitute(
    id: string,
    email: string,
    username: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    departmentId: string | null,
    isActive: boolean,
    lastLoginAt: Date | null,
    passwordResetToken: string | null,
    passwordResetTokenExpiresAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    createdBy: string | null,
    updatedBy: string | null,
  ): User {
    return new User(
      id,
      email,
      username,
      passwordHash,
      firstName,
      lastName,
      role,
      departmentId,
      isActive,
      lastLoginAt,
      passwordResetToken,
      passwordResetTokenExpiresAt,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
    );
  }

  update(props: UpdateUserProps): void {
    if (props.email !== undefined) this.email = props.email;
    if (props.username !== undefined) this.username = props.username;
    if (props.firstName !== undefined) this.firstName = props.firstName;
    if (props.lastName !== undefined) this.lastName = props.lastName;
    if (props.role !== undefined) this.role = props.role;
    if (props.departmentId !== undefined) this.departmentId = props.departmentId;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    this.updatedAt = new Date();
  }

  updatePassword(passwordHash: string): void {
    this.passwordHash = passwordHash;
    this.clearPasswordResetToken();
    this.updatedAt = new Date();
  }

  recordLogin(): void {
    this.lastLoginAt = new Date();
  }

  setPasswordResetToken(token: string, expiresInHours: number = 24): void {
    this.passwordResetToken = token;
    this.passwordResetTokenExpiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  }

  clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.passwordResetTokenExpiresAt = null;
  }

  isPasswordResetTokenValid(token: string): boolean {
    if (!this.passwordResetToken || !this.passwordResetTokenExpiresAt) {
      return false;
    }
    if (this.passwordResetToken !== token) {
      return false;
    }
    return this.passwordResetTokenExpiresAt > new Date();
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin(): boolean {
    return this.role === UserRole.Admin;
  }
}
