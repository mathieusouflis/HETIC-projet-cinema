import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import type { GetMeDTO } from "../dto/responses/get-me-response.js";

export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @param id - Author unique identifier
   * @returns Promise resolving to UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   */
  async execute(id: string): Promise<GetMeDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return {
      email: user.email,
      userId: user.id,
      username: user.username,
    };
  }
}
