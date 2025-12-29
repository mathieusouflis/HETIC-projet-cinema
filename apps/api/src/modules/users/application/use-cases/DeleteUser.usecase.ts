import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";

/**
 * Delete User Use Case
 *
 * Deletes an existing user from the system
 *
 * Following Single Responsibility Principle:
 * - This use case has one job: delete a user
 *
 * Following Dependency Inversion Principle:
 * - Depends on IUserRepository interface, not concrete implementation
 *
 * @example
 * ```ts
 * const deleteUser = new DeleteUserUseCase(userRepository);
 * await deleteUser.execute('123');
 * ```
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Execute the use case
   *
   * @param id - User's unique identifier to delete
   * @returns Promise resolving when deletion is complete
   * @throws UserNotFoundError if user doesn't exist
   */
  async execute(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.delete(id);
  }
}
