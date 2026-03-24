import type { PasswordResetToken } from "../entities/password-reset-token.entity.js";

export interface IPasswordResetTokenRepository {
  create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<PasswordResetToken>;

  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;

  invalidateForUser(userId: string): Promise<void>;

  markUsed(id: string): Promise<void>;
}
