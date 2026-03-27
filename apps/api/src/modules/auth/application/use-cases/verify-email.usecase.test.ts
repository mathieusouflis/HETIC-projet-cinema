import { describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import type { IEmailService } from "../../../../shared/services/email/i-email-service.js";
import type { ITokenService } from "../../../../shared/services/token/i-token-service.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import { EmailVerificationToken } from "../../domain/entities/email-verification-token.entity.js";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository.js";
import type { IRefreshTokenRepository } from "../../domain/interfaces/IRefreshTokenRepository.js";
import { VerifyEmailUseCase } from "./verify-email.usecase.js";

const makeToken = (overrides?: Partial<{ usedAt: string | null }>) =>
  new EmailVerificationToken({
    id: "token-1",
    userId: "user-1",
    tokenHash: "hashed-token",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    usedAt: overrides?.usedAt ?? null,
    createdAt: new Date().toISOString(),
  });

describe("VerifyEmailUseCase", () => {
  it("throws when token is missing", async () => {
    const tokenRepository: IEmailVerificationTokenRepository = {
      findByTokenHash: vi.fn().mockResolvedValue(null),
      markUsed: vi.fn(),
    } as unknown as IEmailVerificationTokenRepository;
    const userRepository: IUserRepository = {
      markEmailVerified: vi.fn(),
      findById: vi.fn(),
    } as unknown as IUserRepository;
    const tokenService: ITokenService = {
      generateTokenPair: vi.fn(),
    } as unknown as ITokenService;
    const emailService: IEmailService = { send: vi.fn() };
    const refreshTokenRepository: IRefreshTokenRepository = {
      create: vi.fn(),
      findByTokenHash: vi.fn(),
      revokeByTokenHash: vi.fn(),
      revokeAllByUserId: vi.fn(),
    } as unknown as IRefreshTokenRepository;
    const useCase = new VerifyEmailUseCase(
      tokenRepository,
      userRepository,
      tokenService,
      emailService,
      refreshTokenRepository
    );

    await expect(
      useCase.execute({ token: "raw-token" })
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(tokenRepository.markUsed).not.toHaveBeenCalled();
  });

  it("marks token used, verifies user and returns auth payload", async () => {
    const tokenRepository: IEmailVerificationTokenRepository = {
      findByTokenHash: vi.fn().mockResolvedValue(makeToken()),
      markUsed: vi.fn().mockResolvedValue(undefined),
    } as unknown as IEmailVerificationTokenRepository;
    const user = {
      id: "user-1",
      email: "john@doe.com",
      username: "john",
      avatarUrl: null,
      bio: null,
      displayName: null,
      emailNotifications: true,
      language: "fr",
      theme: "dark",
      lastLoginAt: null,
      emailVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      toJSON: vi.fn(),
    };
    const userRepository: IUserRepository = {
      markEmailVerified: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(user),
    } as unknown as IUserRepository;
    const tokenService: ITokenService = {
      generateTokenPair: vi.fn().mockReturnValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      }),
    } as unknown as ITokenService;
    const emailService: IEmailService = {
      send: vi.fn().mockResolvedValue(undefined),
    };
    const refreshTokenRepository: IRefreshTokenRepository = {
      create: vi.fn().mockResolvedValue(undefined),
      findByTokenHash: vi.fn(),
      revokeByTokenHash: vi.fn(),
      revokeAllByUserId: vi.fn(),
    } as unknown as IRefreshTokenRepository;
    const useCase = new VerifyEmailUseCase(
      tokenRepository,
      userRepository,
      tokenService,
      emailService,
      refreshTokenRepository
    );

    const [authPayload, refreshToken] = await useCase.execute({
      token: "raw-token",
    });

    expect(tokenRepository.markUsed).toHaveBeenCalledWith("token-1");
    expect(userRepository.markEmailVerified).toHaveBeenCalledWith("user-1");
    expect(emailService.send).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepository.create).toHaveBeenCalledTimes(1);
    expect(refreshToken).toBe("refresh-token");
    expect(authPayload.accessToken).toBe("access-token");
    expect(authPayload.user.id).toBe("user-1");
  });
});
