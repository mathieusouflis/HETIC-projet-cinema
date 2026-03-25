import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import type { IEmailService } from "../../../../shared/services/email/i-email-service.js";
import type { ITokenService } from "../../../../shared/services/token/i-token-service.js";
import type { RefreshToken } from "../../../../shared/services/token/schemas/tokens.schema.js";
import { hashToken } from "../../../../shared/utils/crypto.utils.js";
import { toUserResponseDTO } from "../../../users/application/dto/utils/to-user-response.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository.js";
import type { AuthResponse } from "../dto/response/auth-response.response.validator.js";
import { toAuthResponseDTO } from "../dto/utils/to-auth-response-dto.js";

/**
 * Verify Email Use Case
 *
 * Handles email verification via a token sent by email.
 * On success: marks email as verified, sends welcome email, returns JWT tokens.
 */
export class VerifyEmailUseCase {
  constructor(
    private readonly tokenRepository: IEmailVerificationTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly emailService: IEmailService
  ) {}

  /**
   * @param data - Object containing the raw verification token from URL
   * @returns Promise resolving to [AuthResponse, refreshToken]
   * @throws UnauthorizedError if token is invalid or expired
   */
  async execute(data: {
    token: string;
  }): Promise<[AuthResponse, RefreshToken]> {
    const tokenHash = hashToken(data.token);

    const tokenRecord = await this.tokenRepository.findByTokenHash(tokenHash);

    if (!tokenRecord || !tokenRecord.isValid()) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    await this.tokenRepository.markUsed(tokenRecord.id);
    await this.userRepository.markEmailVerified(tokenRecord.userId);

    const user = await this.userRepository.findById(tokenRecord.userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    await this.emailService.send(
      user.email,
      "Welcome to Kirona!",
      `Hi ${user.username},\n\nYour account has been successfully verified. Welcome to Kirona!\n\nEnjoy your experience.`
    );

    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(
      user.id,
      user.email
    );

    const userResponse = toUserResponseDTO(user);

    return [toAuthResponseDTO(userResponse, accessToken), refreshToken];
  }
}
