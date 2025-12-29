import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { ITokenService } from "../../../../shared/services/token/ITokenService.js";
import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { UserNotFoundError } from "../../../users/domain/errors/UserNotFoundError.js";
import { RefreshTokenDTO } from "../dto/regresh-token.dto.js";
import { TokenResponseDTO } from "../dto/token-response.dro.js";
import { toTokenResponseDTO } from "../dto/utils/to-token-response-dto.js";

/**
 * Refresh Token Use Case
 *
 * Handles token refresh business logic
 * Allows users to obtain a new access token using a valid refresh token
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  /**
   * Execute the token refresh use case
   *
   * @param data - Refresh token data
   * @returns Promise resolving to TokenResponseDTO with new access and refresh tokens
   * @throws UnauthorizedError if refresh token is invalid or expired
   * @throws UserNotFoundError if user no longer exists
   */
  async execute(data: RefreshTokenDTO): Promise<TokenResponseDTO> {
    let payload;

    try {
      payload = this.tokenService.verifyRefreshToken(data.refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UserNotFoundError(payload.userId);
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(
      user.id,
      user.email,
    );

    return toTokenResponseDTO(accessToken, refreshToken);
  }
}
