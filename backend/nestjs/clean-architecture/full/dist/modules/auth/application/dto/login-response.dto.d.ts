import { UserDto } from '@/modules/user-management/application/dto/user.dto';
export declare class LoginResponseDto {
    token: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    refreshTokenExpiresAt: Date;
    user: UserDto;
    constructor(token: string, refreshToken: string, expiresIn: number, refreshTokenExpiresAt: Date, user: UserDto, tokenType?: string);
}
