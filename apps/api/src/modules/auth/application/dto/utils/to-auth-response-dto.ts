import { UserResponseDTO } from "../../../../users/application/dto/user-response.dto";
import { AuthResponseDTO } from "../auth-response.dto";

/**
 * Transform user and tokens to AuthResponseDTO
 *
 * @param user - User response data
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @returns AuthResponseDTO
 */
export function toAuthResponseDTO(
  user: UserResponseDTO,
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
