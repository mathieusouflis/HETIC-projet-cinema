import { AuthResponseDTO } from "../response/auth-response.dto";
import { UserProfileResponseDTO } from "../response/user-profile-respose.dto";

/**
 * Transform user and tokens to AuthResponseDTO
 *
 * @param user - User response data
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @returns AuthResponseDTO
 */
export function toAuthResponseDTO(
  user: UserProfileResponseDTO,
  accessToken: string,
  refreshToken: string,
): AuthResponseDTO {
  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}
