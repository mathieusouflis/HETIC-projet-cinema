import type { User } from "../../../domain/entities";
import type { GetIdResponseDTO } from "../responses/get-id-response";

/**
 * Transform a User entity to a UserResponseDTO
 *
 * @param user - User entity or user-like object
 * @returns UserResponseDTO without sensitive data
 */
export function toUserResponseDTO(user: User): GetIdResponseDTO {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}
