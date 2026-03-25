import { describe, expect, it, vi } from "vitest";
import type { IEmailService } from "../../../../shared/services/email/i-email-service";
import { PasswordService } from "../../../../shared/services/password";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock.";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository";
import { RegisterUseCase } from "./register.usecase";

const mockEmailVerificationTokenRepository: IEmailVerificationTokenRepository =
  {
    create: vi.fn().mockResolvedValue({
      id: "token-id",
      userId: "user-id",
      tokenHash: "hash",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      usedAt: null,
      createdAt: new Date(),
      isExpired: () => false,
      isUsed: () => false,
      isValid: () => true,
    }),
    findByTokenHash: vi.fn().mockResolvedValue(null),
    invalidateForUser: vi.fn().mockResolvedValue(undefined),
    markUsed: vi.fn().mockResolvedValue(undefined),
  };

const mockEmailService: IEmailService = {
  send: vi.fn().mockResolvedValue(undefined),
};

describe("RegisterUseCase", () => {
  const mockedUserRepository = createMockedUserRepository();
  const passwordService = new PasswordService();

  const useCase = new RegisterUseCase(
    mockedUserRepository,
    passwordService,
    mockEmailVerificationTokenRepository,
    mockEmailService
  );

  it("should throw an error when email already exists and is verified", async () => {
    const email = "test1@example.com";
    const username = "fakeUsername";
    const password = "fakePassword";
    await expect(
      useCase.execute({ email, username, password })
    ).rejects.toThrow();
  });

  it("should throw an error when username already exists", async () => {
    const email = "newEmail123@gmail.com";
    const username = "john_doe";
    const password = "fakePassword";
    await expect(
      useCase.execute({ email, username, password })
    ).rejects.toThrow();
  });

  it("should create a user and send a verification email", async () => {
    const email = "newEmail123@gmail.com";
    const username = "new-username";
    const password = "fakePassword";

    const response = await useCase.execute({ email, username, password });

    expect(response).toBeUndefined();
    expect(mockEmailService.send).toHaveBeenCalled();
  });
});
