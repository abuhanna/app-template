import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtTokenService, TokenPayload, TokenPair } from '../../domain/interfaces/jwt-token.service.interface';
export declare class JwtTokenService implements IJwtTokenService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateTokens(payload: TokenPayload): Promise<TokenPair>;
    verifyAccessToken(token: string): Promise<TokenPayload>;
    verifyRefreshToken(token: string): Promise<TokenPayload>;
    generatePasswordResetToken(): string;
    private calculateExpiryDate;
}
