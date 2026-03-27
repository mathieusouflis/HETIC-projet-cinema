import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import type { IPasswordService } from "../../../../shared/services/password/i-password-service";
import { hashToken } from "../../../../shared/utils/crypto.utils";
import type { IUserRepository } from "../../../users/domain/interfaces/IUserRepository";
import type { IPasswordResetTokenRepository } from "../../domain/interfaces/IPasswordResetTokenRepository";
import type { ResetPasswordDTO } from "../dto/request/reset-password.dto";

export class ResetPasswordUseCase {
  constructor(
    private readonly tokenRepository: IPasswordResetTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async execute(data: ResetPasswordDTO): Promise<void> {
    const tokenHash = hashToken(data.token);

    const token = await this.tokenRepository.findByTokenHash(tokenHash);

    if (!token || !token.isValid()) {
      throw new UnauthorizedError("Invalid or expired password reset token");
    }

    const newPasswordHash = await this.passwordService.hash(data.newPassword);

    await this.userRepository.update(token.userId, {
      passwordHash: newPasswordHash,
    });

    await this.tokenRepository.markUsed(token.id);
  }
}
