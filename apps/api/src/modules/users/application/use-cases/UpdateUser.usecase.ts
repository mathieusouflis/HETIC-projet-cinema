import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import { UsernameAlreadyExistsError } from "../../domain/errors/UsernameAlreadyExistsError.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import type { PatchIdRequestDTO } from "../dto/requests/patch-id.validator.js";
import type { PatchIdResponse } from "../dto/response/patch-id.response.validator.js";
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @param id - User's unique identifier
   * @param data - Partial user data to update
   * @returns Promise resolving to updated UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   * @throws UsernameAlreadyExistsError if new username is already taken
   */
  async execute(id: string, data: PatchIdRequestDTO): Promise<PatchIdResponse> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await this.userRepository.existsByUsername(
        data.username
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
