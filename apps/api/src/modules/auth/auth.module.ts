import { Router } from "express";
import { PasswordService } from "../../shared/services/password/PasswordService.js";
import { JWTService } from "../../shared/services/token/JWTService.js";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.usecase.js";
import { AuthController } from "./application/controllers/auth.controller.js";
import { createAuthRouter } from "./presentation/routes/auth.routes.js";
import type { IUserRepository } from "../users/domain/interfaces/IUserRepository.js";
import type { IPasswordService } from "../../shared/services/password/IPasswordService.js";
import type { ITokenService } from "../../shared/services/token/ITokenService.js";
import { RegisterUseCase } from "./application/use-cases/register.usecase.js";
import { LoginUseCase } from "./application/use-cases/login.usecase.js";
import { UserRepository } from "../users/infrastructure/database/repositories/user.repository.js";

/**
 * Auth Module
 *
 * @example
 * ```ts
 * import { authModule } from './modules/auth/auth.module';
 * app.use('/api/auth', authModule.getRouter());
 * ```
 */
class AuthModule {
  // ============================================
  // Infrastructure Layer (External Services)
  // ============================================

  private readonly userRepository: IUserRepository;

  private readonly passwordService: IPasswordService;

  private readonly tokenService: ITokenService;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly registerUseCase: RegisterUseCase;

  private readonly loginUseCase: LoginUseCase;

  private readonly refreshTokenUseCase: RefreshTokenUseCase;

  // ============================================
  // Presentation Layer (Controller)
  // ============================================

  private readonly controller: AuthController;

  private readonly router: Router;

  constructor() {
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.tokenService = new JWTService();

    this.registerUseCase = new RegisterUseCase(
      this.userRepository,
      this.passwordService,
      this.tokenService,
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordService,
      this.tokenService,
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.userRepository,
      this.tokenService,
    );

    this.controller = new AuthController(
      this.registerUseCase,
      this.loginUseCase,
      this.refreshTokenUseCase,
    );

    this.router = createAuthRouter(this.controller);
  }

  /**
   * Get the configured Express router for this module
   *
   * @returns Express Router with all auth routes
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Get the password service instance
   *
   * @returns PasswordService instance
   */
  public getPasswordService(): IPasswordService {
    return this.passwordService;
  }

  /**
   * Get the token service instance
   *
   * @returns TokenService instance
   */
  public getTokenService(): ITokenService {
    return this.tokenService;
  }
}

export const authModule = new AuthModule();
