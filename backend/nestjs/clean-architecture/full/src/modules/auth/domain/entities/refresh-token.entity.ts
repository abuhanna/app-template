

export interface CreateRefreshTokenProps {
  userId: number;
  token: string;
  expiresAt: Date;
  createdByIp?: string | null;
}

export class RefreshToken {
  private constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly token: string,
    public readonly expiresAt: Date,
    public createdByIp: string | null,
    public revokedByIp: string | null,
    public isRevoked: boolean,
    public revokedAt: Date | null,
    public replacedByToken: string | null,
    public createdAt: Date,
  ) {}

  static create(props: CreateRefreshTokenProps): RefreshToken {
    return new RefreshToken(
      0,
      props.userId,
      props.token,
      props.expiresAt,
      props.createdByIp ?? null,
      null,
      false,
      null,
      null,
      new Date(),
    );
  }

  static reconstitute(
    id: number,
    userId: number,
    token: string,
    expiresAt: Date,
    createdByIp: string | null,
    revokedByIp: string | null,
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
      createdByIp,
      revokedByIp,
      isRevoked,
      revokedAt,
      replacedByToken,
      createdAt,
    );
  }

  revoke(replacedByToken?: string, revokedByIp?: string): void {
    this.isRevoked = true;
    this.revokedAt = new Date();
    if (replacedByToken) {
      this.replacedByToken = replacedByToken;
    }
    if (revokedByIp) {
      this.revokedByIp = revokedByIp;
    }
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
