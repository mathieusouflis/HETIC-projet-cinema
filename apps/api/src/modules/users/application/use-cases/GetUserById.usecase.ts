import { UserNotFoundError } from "../../domain/errors/UserNotFoundError";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository";
import type { GetIdResponse } from "../dto/response/get-id.response.validator";
import { toUserResponseDTO } from "../dto/utils/to-user-response";

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @param id - User's unique identifier
   * @returns Promise resolving to UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   */
  async execute(id: string): Promise<GetIdResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return toUserResponseDTO(user);
  }
}
