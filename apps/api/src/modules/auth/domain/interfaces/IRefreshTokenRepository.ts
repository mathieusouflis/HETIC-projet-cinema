export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface IRefreshTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;

  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;

  revoke(tokenHash: string): Promise<void>;

  revokeAllForUser(userId: string): Promise<void>;
}
