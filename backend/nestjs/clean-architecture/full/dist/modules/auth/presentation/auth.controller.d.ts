import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUserPayload } from '@/common/decorators/current-user.decorator';
import { LoginDto, LoginResponseDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, UpdateProfileDto, UserInfoDto } from '../application/dto';
export declare class AuthController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    login(dto: LoginDto): Promise<LoginResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<LoginResponseDto>;
    logout(user: CurrentUserPayload, dto?: RefreshTokenDto): Promise<void>;
    me(user: CurrentUserPayload): Promise<UserInfoDto>;
    getProfile(user: CurrentUserPayload): Promise<UserInfoDto>;
    updateProfile(user: CurrentUserPayload, dto: UpdateProfileDto): Promise<UserInfoDto>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
