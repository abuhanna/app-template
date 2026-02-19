import { ConfigService } from '@nestjs/config';
import { IEmailService, SendEmailOptions } from '../../domain/interfaces/email.service.interface';
export declare class EmailService implements IEmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(options: SendEmailOptions): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void>;
}
