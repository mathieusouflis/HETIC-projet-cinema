import { RefreshTokenResponseDTO } from "../response/refresh-token-response.dto";

/**
 * Transform tokens to TokenResponseDTO
 *
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @returns TokenResponseDTO
 */
export function toTokenResponseDTO(
  accessToken: string,
  refreshToken: string,
): RefreshTokenResponseDTO {
  return {
    accessToken,
    refreshToken,
  };
}
