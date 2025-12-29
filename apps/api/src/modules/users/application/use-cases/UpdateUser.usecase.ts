import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import { UsernameAlreadyExistsError } from "../../domain/errors/UsernameAlreadyExistsError.js";
import { UpdateUserDTO } from "../dto/update.dto.js";
import { UserResponseDTO } from "../dto/user-response.dto.js";
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";

/**
 * Update User Use Case
 *
 * Updates an existing user's profile information
 *
 * Following Single Responsibility Principle:
 * - This use case has one job: update a user's profile
 *
 * Following Dependency Inversion Principle:
 * - Depends on IUserRepository interface, not concrete implementation
 *
 * Following Open/Closed Principle:
 * - Can be extended without modifying the core logic
 *
 * @example
 * ```ts
 * const updateUser = new UpdateUserUseCase(userRepository);
 * const updatedUser = await updateUser.execute('123', { username: 'newname' });
 * ```
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   *
   * @param id - User's unique identifier
   * @param data - Partial user data to update
   * @returns Promise resolving to updated UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   * @throws UsernameAlreadyExistsError if new username is already taken
   */
  async execute(id: string, data: UpdateUserDTO): Promise<UserResponseDTO> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await this.userRepository.existsByUsername(
        data.username,
      );

      if (usernameExists) {
        throw new UsernameAlreadyExistsError(data.username);
      }
    }

    const updatePayload: {
      username?: string;
      avatarUrl?: string | null;
    } = {};

    if (data.username !== undefined) {
      updatePayload.username = data.username;
    }

    if (data.avatarUrl !== undefined) {
      updatePayload.avatarUrl = data.avatarUrl;
    }

    if (Object.keys(updatePayload).length === 0) {
      return toUserResponseDTO(existingUser);
    }

    const updatedUser = await this.userRepository.update(id, updatePayload);

    return toUserResponseDTO(updatedUser);
  }
}
