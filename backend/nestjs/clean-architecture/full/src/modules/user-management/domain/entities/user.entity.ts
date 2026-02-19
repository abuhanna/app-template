import { UserRole } from '../value-objects/user-role';

export interface CreateUserProps {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: number | null;
}

export interface UpdateUserProps {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  departmentId?: number | null;
  isActive?: boolean;
}

export class User {
  private constructor(
    public readonly id: number,
    public email: string,
    public username: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public departmentId: number | null,
    public isActive: boolean,
    public lastLoginAt: Date | null,
    public passwordResetToken: string | null,
    public passwordResetTokenExpiresAt: Date | null,
    public passwordHistory: string[], // Stores last 5 password hashes
    public createdAt: Date,
    public updatedAt: Date,
    public createdBy: number | null,
    public updatedBy: number | null,
  ) {}

  static create(props: CreateUserProps): User {
    const now = new Date();
    return new User(
      0,
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
      [], // Empty password history
      now,
      now,
      null,
      null,
    );
  }

  static reconstitute(
    id: number,
    email: string,
    username: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    departmentId: number | null,
    isActive: boolean,
    lastLoginAt: Date | null,
    passwordResetToken: string | null,
    passwordResetTokenExpiresAt: Date | null,
    passwordHistory: string[],
    createdAt: Date,
    updatedAt: Date,
    createdBy: number | null,
    updatedBy: number | null,
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
      passwordHistory,
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
    // Add current password to history before updating
    if (this.passwordHash) {
      this.passwordHistory.push(this.passwordHash);
      // Keep only last 5 passwords
      if (this.passwordHistory.length > 5) {
        this.passwordHistory.shift();
      }
    }
    this.passwordHash = passwordHash;
    this.clearPasswordResetToken();
    this.updatedAt = new Date();
  }

  isPasswordInHistory(passwordHash: string): boolean {
    return this.passwordHistory.includes(passwordHash);
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
