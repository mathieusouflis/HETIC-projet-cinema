import { UserResponseDTO } from "../user-response.dto";

/**
 * Transform a User entity to a UserResponseDTO
 *
 * @param user - User entity or user-like object
 * @returns UserResponseDTO without sensitive data
 */
export function toUserResponseDTO(user: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserResponseDTO {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
