import { Router } from "express";
import { PasswordService } from "../../shared/services/password/PasswordService.js";
import { JWTService } from "../../shared/services/token/JWTService.js";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.usecase.js";
import { AuthController } from "./application/controllers/auth.controller.js";
import type { IUserRepository } from "../users/domain/interfaces/IUserRepository.js";
import type { IPasswordService } from "../../shared/services/password/IPasswordService.js";
import type { ITokenService } from "../../shared/services/token/ITokenService.js";
import { RegisterUseCase } from "./application/use-cases/register.usecase.js";
import { LoginUseCase } from "./application/use-cases/login.usecase.js";
import { UserRepository } from "../users/infrastructure/database/repositories/user.repository.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/router-generator.js";
import type { IApiModule } from "../../shared/infrastructure/openapi/module-registry.js";

class AuthModule implements IApiModule {
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
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: AuthController;

  private readonly decoratorRouter: DecoratorRouter;

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

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getPasswordService(): IPasswordService {
    return this.passwordService;
  }

  public getTokenService(): ITokenService {
    return this.tokenService;
  }

  public getController(): AuthController {
    return this.controller;
  }
}

export const authModule = new AuthModule();
