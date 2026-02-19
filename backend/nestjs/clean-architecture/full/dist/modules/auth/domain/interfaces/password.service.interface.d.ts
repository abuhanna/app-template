export interface IPasswordService {
    hash(password: string): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
}
export declare const IPasswordService: unique symbol;
