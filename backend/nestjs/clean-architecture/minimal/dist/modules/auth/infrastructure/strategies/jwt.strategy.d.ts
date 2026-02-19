import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../domain/interfaces/jwt-token.service.interface';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: TokenPayload): Promise<{
        sub: number;
        email: string;
        username: string;
        role: string;
    }>;
}
export {};
