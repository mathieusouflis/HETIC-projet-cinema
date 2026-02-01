import { paginationService } from "../../../../shared/services/pagination/index.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import type { GetQueryDTO } from "../dto/requests/get.validator.js";
import type { GetResponseDTO } from "../dto/responses/get-response.js";
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the get users use case with pagination
   *
   * @param pagination - Pagination options (page and limit)
   * @returns Promise resolving to paginated user response
   */
  async execute(pagination: GetQueryDTO): Promise<GetResponseDTO> {
    const { page, limit } = paginationService.parsePageParams({
      page: pagination.page,
      limit: pagination.limit,
    });

    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
    });

    const usersResult = users.map((user) => toUserResponseDTO(user));

    const paginatedResult = paginationService.createPageResult(
      usersResult,
      page,
      limit,
      total
    );

    return {
      users: paginatedResult.items,
      pagination: {
        page: paginatedResult.pagination.page,
        total: paginatedResult.pagination.total,
        totalPages: paginatedResult.pagination.totalPages,
      },
    };
  }
}
