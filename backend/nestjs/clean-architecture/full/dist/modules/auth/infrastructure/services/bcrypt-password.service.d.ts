import { IPasswordService } from '../../domain/interfaces/password.service.interface';
export declare class BcryptPasswordService implements IPasswordService {
    private readonly saltRounds;
    hash(password: string): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
}
