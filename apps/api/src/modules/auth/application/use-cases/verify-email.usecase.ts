import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import type { IEmailService } from "../../../../shared/services/email/i-email-service";
import type { ITokenService } from "../../../../shared/services/token/i-token-service";
import type { RefreshToken } from "../../../../shared/services/token/schemas/tokens.schema";
import {
  getExpiryDate,
  hashToken,
} from "../../../../shared/utils/crypto.utils";
import { toUserResponseDTO } from "../../../users/application/dto/utils/to-user-response";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository";
import type { IEmailVerificationTokenRepository } from "../../domain/interfaces/IEmailVerificationTokenRepository";
import type { IRefreshTokenRepository } from "../../domain/interfaces/IRefreshTokenRepository";
import type { AuthResponse } from "../dto/response/auth-response.response.validator";
import { toAuthResponseDTO } from "../dto/utils/to-auth-response-dto";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
    private readonly emailService: IEmailService,
    private readonly refreshTokenRepository: IRefreshTokenRepository
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

    if (!tokenRecord?.isValid()) {
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

    await this.refreshTokenRepository.create(
      user.id,
      hashToken(refreshToken),
      getExpiryDate(REFRESH_TOKEN_TTL_MS)
    );

    const userResponse = toUserResponseDTO(user);

    return [toAuthResponseDTO(userResponse, accessToken), refreshToken];
  }
}
