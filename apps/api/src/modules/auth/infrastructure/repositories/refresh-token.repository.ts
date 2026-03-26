import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../../../database/index.js";
import { refreshTokens } from "../../../../database/schema.js";
import type {
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from "../../domain/interfaces/IRefreshTokenRepository.js";

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash ?? tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt ?? null,
    };
  }

  async revoke(tokenHash: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date().toISOString() })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date().toISOString() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt))
      );
  }
}
