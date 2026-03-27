import { UserNotFoundError } from "../../domain/errors/UserNotFoundError";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { GetMeResponse } from "../dto/response/get-me.response.validator";

export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @param id - Author unique identifier
   * @returns Promise resolving to UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   */
  async execute(id: string): Promise<GetMeResponse> {
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
