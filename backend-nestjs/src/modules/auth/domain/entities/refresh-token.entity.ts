import { v4 as uuidv4 } from 'uuid';

export interface CreateRefreshTokenProps {
  userId: string;
  token: string;
  expiresAt: Date;
  deviceInfo?: string | null;
  ipAddress?: string | null;
}

export class RefreshToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public deviceInfo: string | null,
    public ipAddress: string | null,
    public isRevoked: boolean,
    public revokedAt: Date | null,
    public replacedByToken: string | null,
    public createdAt: Date,
  ) {}

  static create(props: CreateRefreshTokenProps): RefreshToken {
    return new RefreshToken(
      uuidv4(),
      props.userId,
      props.token,
      props.expiresAt,
      props.deviceInfo ?? null,
      props.ipAddress ?? null,
      false,
      null,
      null,
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo: string | null,
    ipAddress: string | null,
    isRevoked: boolean,
    revokedAt: Date | null,
    replacedByToken: string | null,
    createdAt: Date,
  ): RefreshToken {
    return new RefreshToken(
      id,
      userId,
      token,
      expiresAt,
      deviceInfo,
      ipAddress,
      isRevoked,
      revokedAt,
      replacedByToken,
      createdAt,
    );
  }

  revoke(replacedByToken?: string): void {
    this.isRevoked = true;
    this.revokedAt = new Date();
    if (replacedByToken) {
      this.replacedByToken = replacedByToken;
    }
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
