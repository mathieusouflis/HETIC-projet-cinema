import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import { UserListResponseDTO } from "../dto/list-response.dto.js";
import { PaginationDTO } from "../dto/pagination.dto.js";
import { toUserListResponseDTO } from "../dto/utils/to-user-list-response.js";

/**
 * Get Users Use Case
 *
 * Retrieves a paginated list of users
 *
 * Following Single Responsibility Principle:
 * - This use case has one job: fetch a paginated list of users
 *
 * Following Dependency Inversion Principle:
 * - Depends on IUserRepository interface, not concrete implementation
 *
 * @example
 * ```ts
 * const getUsers = new GetUsersUseCase(userRepository);
 * const users = await getUsers.execute({ page: 1, limit: 10 });
 * ```
 */
export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   *
   * @param pagination - Pagination options (page and limit)
   * @returns Promise resolving to UserListResponseDTO with users and pagination info
   */
  async execute(pagination: PaginationDTO): Promise<UserListResponseDTO> {
    const page = Math.max(1, pagination.page);
    const limit = Math.min(100, Math.max(1, pagination.limit));

    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
    });

    return toUserListResponseDTO(users, total, page, limit);
  }
}
