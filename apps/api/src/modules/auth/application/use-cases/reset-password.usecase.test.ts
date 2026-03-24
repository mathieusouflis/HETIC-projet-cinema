import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { PasswordService } from "../../../../shared/services/password";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock.";
import { PasswordResetToken } from "../../domain/entities/password-reset-token.entity";
import { createMockedPasswordResetTokenRepository } from "../../domain/interfaces/password-reset-token.repository.mock.";
import { ResetPasswordUseCase } from "./reset-password.usecase";

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function makeToken(
  overrides: Partial<ConstructorParameters<typeof PasswordResetToken>[0]>
): PasswordResetToken {
  return new PasswordResetToken({
    id: "test-token-id",
    userId: "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
    tokenHash: "somehash",
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  });
}

describe("ResetPasswordUseCase", () => {
  const passwordService = new PasswordService();
  const userRepository = createMockedUserRepository();

  it("should throw when token is not found", async () => {
    const tokenRepository = createMockedPasswordResetTokenRepository({
      findByTokenHash: () => Promise.resolve(null),
    });
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      userRepository,
      passwordService
    );

    await expect(
      useCase.execute({ token: "unknowntoken", newPassword: "NewPass123!" })
    ).rejects.toThrow("Invalid or expired password reset token");
  });

  it("should throw when token is expired", async () => {
    const rawToken = "expiredrawtoken";
    const tokenHash = hashToken(rawToken);

    const expiredToken = makeToken({
      tokenHash,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    const tokenRepository = createMockedPasswordResetTokenRepository({
      findByTokenHash: (hash: string) =>
        Promise.resolve(hash === tokenHash ? expiredToken : null),
    });
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      userRepository,
      passwordService
    );

    await expect(
      useCase.execute({ token: rawToken, newPassword: "NewPass123!" })
    ).rejects.toThrow("Invalid or expired password reset token");
  });

  it("should throw when token is already used", async () => {
    const rawToken = "usedrawtoken";
    const tokenHash = hashToken(rawToken);

    const usedToken = makeToken({
      tokenHash,
      usedAt: new Date().toISOString(),
    });

    const tokenRepository = createMockedPasswordResetTokenRepository({
      findByTokenHash: (hash: string) =>
        Promise.resolve(hash === tokenHash ? usedToken : null),
    });
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      userRepository,
      passwordService
    );

    await expect(
      useCase.execute({ token: rawToken, newPassword: "NewPass123!" })
    ).rejects.toThrow("Invalid or expired password reset token");
  });

  it("should update password and mark token used on valid token", async () => {
    const rawToken = "validrawtoken";
    const tokenHash = hashToken(rawToken);

    const validToken = makeToken({ tokenHash, id: "valid-token-id" });

    const tokenRepository = createMockedPasswordResetTokenRepository({
      findByTokenHash: (hash: string) =>
        Promise.resolve(hash === tokenHash ? validToken : null),
    });
    const useCase = new ResetPasswordUseCase(
      tokenRepository,
      userRepository,
      passwordService
    );

    await expect(
      useCase.execute({ token: rawToken, newPassword: "NewPass123!" })
    ).resolves.toBeUndefined();

    expect(userRepository.update).toHaveBeenCalledWith(
      "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2",
      expect.objectContaining({ passwordHash: expect.any(String) })
    );
    expect(tokenRepository.markUsed).toHaveBeenCalledWith("valid-token-id");
  });
});
