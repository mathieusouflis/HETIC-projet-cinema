import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { PasswordService } from "../../../../shared/services/password/password-service.js";
import { EmailAlreadyExistsError } from "../../domain/errors/EmailAlreadyExistsError.js";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.js";
import { UsernameAlreadyExistsError } from "../../domain/errors/UsernameAlreadyExistsError.js";
import type { IUserRepository } from "../../domain/interfaces/IUserRepository.js";
import type { PatchIdRequestDTO } from "../dto/requests/patch-id.validator.js";
import type { PatchIdResponse } from "../dto/response/patch-id.response.validator.js";
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";

export class UpdateUserUseCase {
  private readonly passwordService: PasswordService;

  constructor(private readonly userRepository: IUserRepository) {
    this.passwordService = new PasswordService();
  }

  /**
   * @param id - User's unique identifier
   * @param data - Partial user data to update
   * @returns Promise resolving to updated UserResponseDTO
   * @throws UserNotFoundError if user doesn't exist
   * @throws UsernameAlreadyExistsError if new username is already taken
   * @throws EmailAlreadyExistsError if new email is already taken
   * @throws ValidationError if password validation fails
   */
  async execute(id: string, data: PatchIdRequestDTO): Promise<PatchIdResponse> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    if (data.password) {
      if (
        !(await this.passwordService.compare(
          data.password,
          existingUser.passwordHash ?? ""
        ))
      ) {
        throw new ValidationError("Invalid password");
      }

      if (data.newPassword !== data.confirmPassword) {
        throw new ValidationError("Passwords do not match");
      }
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await this.userRepository.existsByUsername(
        data.username
      );

      if (usernameExists) {
        throw new UsernameAlreadyExistsError(data.username);
      }
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.existsByEmail(data.email);

      if (emailExists) {
        throw new EmailAlreadyExistsError(data.email);
      }
    }

    const updatePayload: {
      username?: string;
      email?: string;
      avatarUrl?: string | null;
      passwordHash?: string;
    } = {};

    if (data.username !== undefined) {
      updatePayload.username = data.username;
    }

    if (data.email !== undefined) {
      updatePayload.email = data.email;
    }

    if (data.avatarUrl !== undefined) {
      updatePayload.avatarUrl = data.avatarUrl;
    }

    if (data.newPassword) {
      const hashedPassword = await this.passwordService.hash(data.newPassword);
      updatePayload.passwordHash = hashedPassword;
    }

    if (Object.keys(updatePayload).length === 0) {
      return toUserResponseDTO(existingUser);
    }

    const updatedUser = await this.userRepository.update(id, updatePayload);

    return toUserResponseDTO(updatedUser);
  }
}
