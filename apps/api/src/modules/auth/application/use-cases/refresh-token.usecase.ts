import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import type {
  ITokenService,
  RefreshTokenPayload,
} from "../../../../shared/services/token/i-token-service";
import type { RefreshToken } from "../../../../shared/services/token/schemas/tokens.schema";
import {
  getExpiryDate,
  hashToken,
} from "../../../../shared/utils/crypto.utils";
import { UserNotFoundError } from "../../../users/domain/errors/UserNotFoundError";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository";
import type { IRefreshTokenRepository } from "../../domain/interfaces/IRefreshTokenRepository";
import type { RefreshTokenDTO } from "../dto/request/refresh-token.dto";
import type { RefreshTokenResponse } from "../dto/response/refresh-token.response.validator";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  /**
   * @param data - Refresh token data
   * @returns Promise resolving to TokenResponseDTO with new access and refresh tokens
   * @throws UnauthorizedError if refresh token is invalid, expired, or revoked
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

    const tokenHash = hashToken(data.refreshToken);
    const record = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      !record ||
      record.revokedAt !== null ||
      new Date(record.expiresAt) < new Date()
    ) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new UserNotFoundError(payload.userId);
    }

    await this.refreshTokenRepository.revoke(tokenHash);

    const { accessToken: responseData, refreshToken } =
      this.tokenService.generateTokenPair(user.id, user.email);

    await this.refreshTokenRepository.create(
      user.id,
      hashToken(refreshToken),
      getExpiryDate(REFRESH_TOKEN_TTL_MS)
    );

    const userJSON = user.toJSON();

    return [
      {
        user: {
          id: userJSON.id,
          username: userJSON.username,
          avatarUrl: userJSON.avatarUrl,
          createdAt: userJSON.createdAt,
        },
        accessToken: responseData,
      },
      refreshToken,
    ];
  }
}
