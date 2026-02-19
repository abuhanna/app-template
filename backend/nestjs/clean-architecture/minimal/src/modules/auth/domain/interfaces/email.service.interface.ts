export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void>;
}

export const IEmailService = Symbol('IEmailService');
