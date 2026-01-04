import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { IPasswordService } from "../../../../shared/services/password/IPasswordService.js";
import type { ITokenService } from "../../../../shared/services/token/ITokenService.js";
import { EmailAlreadyExistsError } from "../../../users/domain/errors/EmailAlreadyExistsError.js";
import { UsernameAlreadyExistsError } from "../../../users/domain/errors/UsernameAlreadyExistsError.js";
import { toAuthResponseDTO } from "../dto/utils/to-auth-response-dto.js";
import { toUserResponseDTO } from "../../../users/application/dto/utils/to-user-response.js";
import { AuthResponseDTO } from "../dto/response/auth-response.dto.js";
import { RegisterDTO } from "../dto/request/register.dto.js";

/**
 * Register Use Case
 *
 * Handles user registration business logic
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
  ) {}

  /**
   * @param data - Registration data (email, username, password)
   * @returns Promise resolving to AuthResponseDTO with user and tokens
   * @throws EmailAlreadyExistsError if email is already registered
   * @throws UsernameAlreadyExistsError if username is already taken
   */
  async execute(data: RegisterDTO): Promise<AuthResponseDTO> {
    const emailExists = await this.userRepository.existsByEmail(data.email);

    if (emailExists) {
      throw new EmailAlreadyExistsError(data.email);
    }

    const usernameExists = await this.userRepository.existsByUsername(
      data.username,
    );

    if (usernameExists) {
      throw new UsernameAlreadyExistsError(data.username);
    }

    const passwordHash = await this.passwordService.hash(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(
      user.id,
      user.email,
    );

    const userResponse = toUserResponseDTO(user);

    return toAuthResponseDTO(userResponse, accessToken, refreshToken);
  }
}
