import { TokenResponseDTO } from "../token-response.dro";

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
): TokenResponseDTO {
  return {
    accessToken,
    refreshToken,
  };
}
