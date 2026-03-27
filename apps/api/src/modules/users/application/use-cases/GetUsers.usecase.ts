import { paginationService } from "../../../../shared/services/pagination/pagination.service";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { GetQueryDTO } from "../dto/requests/get.validator";
import type { GetAllUsersResponse } from "../dto/response/get.response.validator";
import { toUserResponseDTO } from "../dto/utils/to-user-response";

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the get users use case with pagination
   *
   * @param pagination - Pagination options (page and limit)
   * @returns Promise resolving to paginated user response
   */
  async execute(pagination: GetQueryDTO): Promise<GetAllUsersResponse> {
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
