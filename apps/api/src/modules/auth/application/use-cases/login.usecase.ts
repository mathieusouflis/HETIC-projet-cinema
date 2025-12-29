import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository.js";
import type { IPasswordService } from "../../../../shared/services/password/IPasswordService.js";
import type { ITokenService } from "../../../../shared/services/token/ITokenService.js";
import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { LoginDTO } from "../dto/login.dto.js";
import { AuthResponseDTO } from "../dto/auth-response.dto.js";
import { toAuthResponseDTO } from "../dto/utils/to-auth-response-dto.js";
import { toUserResponseDTO } from "../../../users/application/dto/utils/to-user-response.js";

/**
 * Login Use Case
 *
 * Handles user authentication business logic
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly tokenService: ITokenService,
  ) {}

  /**
   * Execute the login use case
   *
   * @param data - Login credentials (email, password)
   * @returns Promise resolving to AuthResponseDTO with user and tokens
   * @throws UnauthorizedError if credentials are invalid
   */
  async execute(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await this.passwordService.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(
      user.id,
      user.email,
    );

    const userResponse = toUserResponseDTO(user);

    return toAuthResponseDTO(userResponse, accessToken, refreshToken);
  }
}
