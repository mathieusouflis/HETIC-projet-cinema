import type { AuthResponse } from "../response/auth-response.response.validator";
import type { UserProfileResponse } from "../response/user-profile.response.validator";

/**
 * Transform user and tokens to AuthResponse
 *
 * @param user - User response data
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @returns AuthResponse
 */
export function toAuthResponseDTO(
  user: UserProfileResponse,
  accessToken: string
): AuthResponse {
  return {
    user,
    accessToken,
  };
}
