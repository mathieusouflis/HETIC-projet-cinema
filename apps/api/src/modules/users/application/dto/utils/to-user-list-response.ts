import type { User } from "../../../domain";
import type { GetResponseDTO } from "../responses/get-response";
import { toUserResponseDTO } from "./to-user-response";

/**
 * Transform an array of users to a paginated response
 *
 * @param users - Array of User entities
 * @param total - Total count of users
 * @param page - Current page number
 * @param limit - Items per page
 * @returns UserListResponseDTO with pagination info
 */
export function toUserListResponseDTO(
  users: User[],
  total: number,
  page: number,
  limit: number
): GetResponseDTO {
  return {
    users: users.map((user) => toUserResponseDTO(user)),
    pagination: {
      page,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
