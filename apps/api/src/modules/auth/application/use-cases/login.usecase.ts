import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import type { IPasswordService } from "../../../../shared/services/password/i-password-service";
import type { ITokenService } from "../../../../shared/services/token/i-token-service";
import type { RefreshToken } from "../../../../shared/services/token/schemas/tokens.schema";
import {
  getExpiryDate,
  hashToken,
} from "../../../../shared/utils/crypto.utils";
import { toUserResponseDTO } from "../../../users/application/dto/utils/to-user-response";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository";
import type { IRefreshTokenRepository } from "../../domain/interfaces/IRefreshTokenRepository";
import type { LoginDTO } from "../dto/request/login.dto";
import type { AuthResponse } from "../dto/response/auth-response.response.validator";
import { toAuthResponseDTO } from "../dto/utils/to-auth-response-dto";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Login Use Case
 *
 * Handles user authentication business logic
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  /**
   * @param data - Login credentials (email, password)
   * @returns Promise resolving to AuthResponseDTO with user and tokens
   * @throws UnauthorizedError if credentials are invalid
   */
  async execute(data: LoginDTO): Promise<[AuthResponse, RefreshToken]> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await this.passwordService.compare(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isEmailVerified()) {
      throw new ForbiddenError("EMAIL_NOT_VERIFIED");
    }

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
