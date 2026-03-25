import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEmailService } from "../../../../shared/services/email/i-email-service";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock.";
import { createMockedPasswordResetTokenRepository } from "../../domain/interfaces/password-reset-token.repository.mock.";
import { ForgotPasswordUseCase } from "./forgot-password.usecase";

const mockEmailService: IEmailService = {
  send: vi.fn().mockResolvedValue(undefined),
};

describe("ForgotPasswordUseCase", () => {
  let tokenRepository: ReturnType<
    typeof createMockedPasswordResetTokenRepository
  >;
  let useCase: ForgotPasswordUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    tokenRepository = createMockedPasswordResetTokenRepository();
    const userRepository = createMockedUserRepository();

    useCase = new ForgotPasswordUseCase(
      userRepository,
      tokenRepository,
      mockEmailService
    );
  });

  it("should silently succeed when user is not found (no enumeration)", async () => {
    await expect(
      useCase.execute({ email: "nonexistent@example.com" })
    ).resolves.toBeUndefined();

    expect(mockEmailService.send).not.toHaveBeenCalled();
    expect(tokenRepository.create).not.toHaveBeenCalled();
  });

  it("should create a token and send email when user exists", async () => {
    await expect(
      useCase.execute({ email: "test1@example.com" })
    ).resolves.toBeUndefined();

    expect(tokenRepository.invalidateForUser).toHaveBeenCalledWith(
      "52dfbd95-b2ba-4b76-8aa5-9fe818bda2a2"
    );
    expect(tokenRepository.create).toHaveBeenCalledOnce();
    expect(mockEmailService.send).toHaveBeenCalledOnce();

    const sendMock = mockEmailService.send as ReturnType<typeof vi.fn>;
    const firstCall = sendMock.mock.calls[0];
    expect(firstCall).toBeDefined();
    const emailTo = firstCall?.[0] as string;
    const resetUrl = firstCall?.[2] as string;
    expect(emailTo).toBe("test1@example.com");
    expect(resetUrl).toContain("/reset-password?token=");
  });

  it("should invalidate previous tokens before creating a new one", async () => {
    await useCase.execute({ email: "test2@example.com" });

    expect(tokenRepository.invalidateForUser).toHaveBeenCalledBefore(
      tokenRepository.create as ReturnType<typeof vi.fn>
    );
  });
});
