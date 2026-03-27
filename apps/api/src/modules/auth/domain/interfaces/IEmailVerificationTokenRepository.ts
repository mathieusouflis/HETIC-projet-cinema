import type { EmailVerificationToken } from "../entities/email-verification-token.entity";

export interface IEmailVerificationTokenRepository {
  create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<EmailVerificationToken>;

  findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null>;

  invalidateForUser(userId: string): Promise<void>;

  markUsed(id: string): Promise<void>;
}
