import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import { UserResponseDTO } from "../dto/user-response.dto.js";
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";

/**
 * Get User By ID Use Case
 *
 * Retrieves a single user by their unique identifier
 *
 * Following Single Responsibility Principle:
 * - This use case has one job: fetch a user by ID
 *
 * Following Dependency Inversion Principle:
 * - Depends on IUserRepository interface, not concrete implementation
 *
 * @example
 * ```ts
 * const getUserById = new GetUserByIdUseCase(userRepository);
 * const user = await getUserById.execute('123');
 * ```
 */
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   *
   * @param id - User's unique identifier
   * @returns Promise resolving to UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   */
  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return toUserResponseDTO(user);
  }
}
