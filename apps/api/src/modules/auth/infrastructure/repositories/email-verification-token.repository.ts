import { eq } from "drizzle-orm";
import { db } from "../../../../database/index.js";
import { emailVerificationTokens } from "../../../../database/schema.js";
import {
  EmailVerificationToken,
  type EmailVerificationTokenRow,
} from "../../domain/entities/email-verification-token.entity.js";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository.js";

export class EmailVerificationTokenRepository
  implements IEmailVerificationTokenRepository
{
  private mapToDomain(row: EmailVerificationTokenRow): EmailVerificationToken {
    return new EmailVerificationToken(row);
  }

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<EmailVerificationToken> {
    const [row] = await db
      .insert(emailVerificationTokens)
      .values({
        userId,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
      })
      .returning();

    return this.mapToDomain(row as EmailVerificationTokenRow);
  }

  async findByTokenHash(
    tokenHash: string
  ): Promise<EmailVerificationToken | null> {
    const [row] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row as EmailVerificationTokenRow);
  }

  async invalidateForUser(userId: string): Promise<void> {
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(emailVerificationTokens.userId, userId));
  }

  async markUsed(id: string): Promise<void> {
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date().toISOString() })
      .where(eq(emailVerificationTokens.id, id));
  }
}
