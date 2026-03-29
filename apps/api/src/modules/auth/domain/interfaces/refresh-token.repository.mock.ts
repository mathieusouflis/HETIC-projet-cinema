import type {
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from "./IRefreshTokenRepository";

export function createMockedRefreshTokenRepository(): IRefreshTokenRepository {
  const store = new Map<string, RefreshTokenRecord>();

  return {
    async create(userId, tokenHash, expiresAt) {
      store.set(tokenHash, {
        id: crypto.randomUUID(),
        userId,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
        revokedAt: null,
      });
    },

    async findByTokenHash(tokenHash) {
      return store.get(tokenHash) ?? null;
    },

    async revoke(tokenHash) {
      const record = store.get(tokenHash);
      if (record) {
        store.set(tokenHash, {
          ...record,
          revokedAt: new Date().toISOString(),
        });
      }
    },

    async revokeAllForUser(userId) {
      for (const [key, record] of store.entries()) {
        if (record.userId === userId && record.revokedAt === null) {
          store.set(key, { ...record, revokedAt: new Date().toISOString() });
        }
      }
    },
  };
}
