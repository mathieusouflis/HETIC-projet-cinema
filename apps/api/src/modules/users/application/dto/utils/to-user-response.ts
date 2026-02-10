import type { User } from "../../../domain/entities";
import type { GetIdResponse } from "../response/get-id.response.validator";

/**
 * Transform a User entity to a UserResponseDTO
 *
 * @param user - User entity or user-like object
 * @returns UserResponseDTO without sensitive data
 */
export function toUserResponseDTO(user: User): GetIdResponse {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}
