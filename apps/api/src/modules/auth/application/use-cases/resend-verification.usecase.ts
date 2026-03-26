import { config } from "@packages/config";
import type { IEmailService } from "../../../../shared/services/email/i-email-service.js";
import {
  generateSecureToken,
  getExpiryDate,
  hashToken,
} from "../../../../shared/utils/crypto.utils.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import { EMAIL_VERIFICATION_TOKEN_EXPIRY_MS } from "../../domain/constants.js";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository.js";

/**
 * Resend Verification Email Use Case
 *
 * Sends a new verification email to an unverified user.
 * Returns silently if user not found or already verified (prevents enumeration).
 */
export class ResendVerificationUseCase {
  constructor(
    private readonly tokenRepository: IEmailVerificationTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  /**
   * @param data - Object containing the user's email address
   * @returns Promise resolving to void (always, to prevent user enumeration)
   */
  async execute(data: { email: string }): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user || user.isEmailVerified()) {
      return;
    }

    await this.tokenRepository.invalidateForUser(user.id);

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getExpiryDate(EMAIL_VERIFICATION_TOKEN_EXPIRY_MS);

    await this.tokenRepository.create(user.id, tokenHash, expiresAt);

    const verificationUrl = `${config.env.frontend.url}/verify-email?token=${rawToken}`;
    await this.emailService.send(
      user.email,
      "Verify your email address",
      `Welcome to Kirona! Click the link below to verify your email address (expires in 15 minutes):\n\n${verificationUrl}\n\nIf you did not create an account, please ignore this email.`
    );
  }
}
