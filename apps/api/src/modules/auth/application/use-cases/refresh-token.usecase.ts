import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import type {
  ITokenService,
  RefreshTokenPayload,
} from "../../../../shared/services/token/i-token-service.js";
import type { RefreshToken } from "../../../../shared/services/token/schemas/tokens.schema.js";
import { UserNotFoundError } from "../../../users/domain/errors/UserNotFoundError.js";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { RefreshTokenDTO } from "../dto/request/refresh-token.dto.js";
import type { RefreshTokenResponse } from "../dto/response/refresh-token.response.validator.js";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  /**
   * @param data - Refresh token data
   * @returns Promise resolving to TokenResponseDTO with new access and refresh tokens
   * @throws UnauthorizedError if refresh token is invalid or expired
   * @throws UserNotFoundError if user no longer exists
   */
  async execute(
    data: RefreshTokenDTO
  ): Promise<[RefreshTokenResponse, RefreshToken]> {
    let payload: RefreshTokenPayload;

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
      user.email
    );

    return [accessToken, refreshToken];
  }
}
