import { describe, expect, it, vi } from "vitest";
import type { IEmailService } from "../../../../shared/services/email/i-email-service.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository.js";
import { ResendVerificationUseCase } from "./resend-verification.usecase.js";

describe("ResendVerificationUseCase", () => {
  it("returns silently when user does not exist", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
    } as unknown as IUserRepository;
    const tokenRepository: IEmailVerificationTokenRepository = {
      invalidateForUser: vi.fn(),
      create: vi.fn(),
    } as unknown as IEmailVerificationTokenRepository;
    const emailService: IEmailService = {
      send: vi.fn(),
    };
    const useCase = new ResendVerificationUseCase(
      tokenRepository,
      userRepository,
      emailService
    );

    await useCase.execute({ email: "missing@user.com" });

    expect(tokenRepository.invalidateForUser).not.toHaveBeenCalled();
    expect(tokenRepository.create).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it("returns silently when user is already verified", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue({
        id: "user-1",
        isEmailVerified: () => true,
      }),
    } as unknown as IUserRepository;
    const tokenRepository: IEmailVerificationTokenRepository = {
      invalidateForUser: vi.fn(),
      create: vi.fn(),
    } as unknown as IEmailVerificationTokenRepository;
    const emailService: IEmailService = {
      send: vi.fn(),
    };
    const useCase = new ResendVerificationUseCase(
      tokenRepository,
      userRepository,
      emailService
    );

    await useCase.execute({ email: "john@doe.com" });

    expect(tokenRepository.invalidateForUser).not.toHaveBeenCalled();
    expect(tokenRepository.create).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });

  it("creates a token and sends verification email for unverified user", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue({
        id: "user-2",
        email: "jane@doe.com",
        isEmailVerified: () => false,
      }),
    } as unknown as IUserRepository;
    const tokenRepository: IEmailVerificationTokenRepository = {
      invalidateForUser: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({}),
    } as unknown as IEmailVerificationTokenRepository;
    const emailService: IEmailService = {
      send: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new ResendVerificationUseCase(
      tokenRepository,
      userRepository,
      emailService
    );

    await useCase.execute({ email: "jane@doe.com" });

    expect(tokenRepository.invalidateForUser).toHaveBeenCalledWith("user-2");
    expect(tokenRepository.create).toHaveBeenCalledTimes(1);
    expect(emailService.send).toHaveBeenCalledTimes(1);
  });
});
