import { config } from "@packages/config";
import type { IEmailService } from "../../../../shared/services/email/i-email-service";
import {
  generateSecureToken,
  getExpiryDate,
  hashToken,
} from "../../../../shared/utils/crypto.utils";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository";
import type { IPasswordResetTokenRepository } from "../../domain/interfaces/IPasswordResetTokenRepository";
import type { ForgotPasswordDTO } from "../dto/request/forgot-password.dto";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: IPasswordResetTokenRepository,
    private readonly emailService: IEmailService
  ) {}

  async execute(data: ForgotPasswordDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);
    // Silently return if user not found to prevent user enumeration
    if (!user) {
      return;
    }

    // Invalidate any existing tokens for this user
    await this.tokenRepository.invalidateForUser(user.id);

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getExpiryDate(TOKEN_EXPIRY_MS);

    await this.tokenRepository.create(user.id, tokenHash, expiresAt);

    const resetUrl = `${config.env.frontend.url}/reset-password?token=${rawToken}`;

    await this.emailService.send(
      user.email,
      "Reset your password",
      `You requested a password reset. Click the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    );
  }
}
