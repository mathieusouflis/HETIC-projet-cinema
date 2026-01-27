import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import type { GetIdResponseDTO } from "../dto/responses/get-id-response.js";
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @param id - User's unique identifier
   * @returns Promise resolving to UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   */
  async execute(id: string): Promise<GetIdResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return toUserResponseDTO(user);
  }
}
