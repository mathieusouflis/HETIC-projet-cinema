import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
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
