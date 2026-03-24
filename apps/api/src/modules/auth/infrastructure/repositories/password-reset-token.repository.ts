import { eq } from "drizzle-orm";
import { db } from "../../../../database/index.js";
import { passwordResetTokens } from "../../../../database/schema.js";
import {
  PasswordResetToken,
  type PasswordResetTokenRow,
} from "../../domain/entities/password-reset-token.entity.js";
import type { IPasswordResetTokenRepository } from "../../domain/interfaces/IPasswordResetTokenRepository.js";

export class PasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  private mapToDomain(row: PasswordResetTokenRow): PasswordResetToken {
    return new PasswordResetToken(row);
  }

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<PasswordResetToken> {
    const [row] = await db
      .insert(passwordResetTokens)
      .values({
        userId,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
      })
      .returning();

    return this.mapToDomain(row as PasswordResetTokenRow);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row as PasswordResetTokenRow);
  }

  async invalidateForUser(userId: string): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, userId));
  }

  async markUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(passwordResetTokens.id, id));
  }
}
