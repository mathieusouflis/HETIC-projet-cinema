import { hashToken } from "../../../../shared/utils/crypto.utils";
import type { IRefreshTokenRepository } from "../../domain/interfaces/IRefreshTokenRepository";

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const tokenHash = hashToken(refreshToken);
    await this.refreshTokenRepository.revoke(tokenHash);
  }
}
