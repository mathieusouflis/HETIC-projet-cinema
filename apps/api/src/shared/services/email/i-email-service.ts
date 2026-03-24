export interface IEmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}
