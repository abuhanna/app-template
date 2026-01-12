export interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface IJwtTokenService {
  generateTokens(payload: TokenPayload): Promise<TokenPair>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
  generatePasswordResetToken(): string;
}

export const IJwtTokenService = Symbol('IJwtTokenService');
