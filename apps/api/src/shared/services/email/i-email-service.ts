export interface IEmailService {
  send(to: string, subject: string, text: string): Promise<void>;
}
