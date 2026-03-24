import { vi } from "vitest";
import { PasswordResetToken } from "../entities/password-reset-token.entity.js";
import type { IPasswordResetTokenRepository } from "./IPasswordResetTokenRepository.js";

const ONE_HOUR = 60 * 60 * 1000;

export const MOCK_VALID_TOKEN_HASH =
  "aabbcc112233aabbcc112233aabbcc112233aabbcc112233aabbcc112233aabb";
export const MOCK_EXPIRED_TOKEN_HASH =
  "expired0000000000000000000000000000000000000000000000000000000000";
export const MOCK_USED_TOKEN_HASH =
  "used00000000000000000000000000000000000000000000000000000000000000";

const mockValidToken = new PasswordResetToken({
  id: "aaaaaaaa-0000-0000-0000-000000000001",
  userId: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
  tokenHash: MOCK_VALID_TOKEN_HASH,
  expiresAt: new Date(Date.now() + ONE_HOUR).toISOString(),
  usedAt: null,
  createdAt: new Date().toISOString(),
});

const mockExpiredToken = new PasswordResetToken({
  id: "aaaaaaaa-0000-0000-0000-000000000002",
  userId: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
  tokenHash: MOCK_EXPIRED_TOKEN_HASH,
  expiresAt: new Date(Date.now() - ONE_HOUR).toISOString(),
  usedAt: null,
  createdAt: new Date().toISOString(),
});

const mockUsedToken = new PasswordResetToken({
  id: "aaaaaaaa-0000-0000-0000-000000000003",
  userId: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
  tokenHash: MOCK_USED_TOKEN_HASH,
  expiresAt: new Date(Date.now() + ONE_HOUR).toISOString(),
  usedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

const allMockedTokens = [mockValidToken, mockExpiredToken, mockUsedToken];

export function createMockedPasswordResetTokenRepository(
  overrides: Partial<IPasswordResetTokenRepository> = {}
): IPasswordResetTokenRepository {
  const defaults: IPasswordResetTokenRepository = {
    create: vi.fn().mockResolvedValue(mockValidToken),
    findByTokenHash: (tokenHash: string) =>
      Promise.resolve(
        allMockedTokens.find((t) => t.tokenHash === tokenHash) ?? null
      ),
    invalidateForUser: vi.fn().mockResolvedValue(undefined),
    markUsed: vi.fn().mockResolvedValue(undefined),
  };

  return {
    ...defaults,
    ...overrides,
  };
}
