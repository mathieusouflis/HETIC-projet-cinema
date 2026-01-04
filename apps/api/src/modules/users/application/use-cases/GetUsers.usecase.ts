import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import { GetQueryDTO } from "../dto/requests/get.validator.js";
import { GetResponseDTO } from "../dto/responses/get-response.js";
import { toUserListResponseDTO } from "../dto/utils/to-user-list-response.js";

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @param pagination - Pagination options (page and limit)
   * @returns Promise resolving to UserListResponseDTO with users and pagination info
   */
  async execute(pagination: GetQueryDTO): Promise<GetResponseDTO> {
    const page = Math.max(1, pagination.page);
    const limit = Math.min(100, Math.max(1, pagination.limit));

    const { users, total } = await this.userRepository.findAll({
      page,
      limit,
    });

    return toUserListResponseDTO(users, total, page, limit);
  }
}
