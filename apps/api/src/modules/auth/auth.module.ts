import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator.js";
import type { IEmailService } from "../../shared/services/email/i-email-service.js";
import { MailgunEmailService } from "../../shared/services/email/mailgun.service.js";
import type { IPasswordService } from "../../shared/services/password/i-password-service.js";
import { PasswordService } from "../../shared/services/password/password-service.js";
import type { ITokenService } from "../../shared/services/token/i-token-service.js";
import { JWTService } from "../../shared/services/token/jwt-service.js";
import type { IUserRepository } from "../users/domain/interfaces/IUserRepository.js";
import { UserRepository } from "../users/infrastructure/database/repositories/user.repository.js";
import { AuthController } from "./application/controllers/auth.controller.js";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.usecase.js";
import { LoginUseCase } from "./application/use-cases/login.usecase.js";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.usecase.js";
import { RegisterUseCase } from "./application/use-cases/register.usecase.js";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.usecase.js";
import type { IPasswordResetTokenRepository } from "./domain/interfaces/IPasswordResetTokenRepository.js";
import { PasswordResetTokenRepository } from "./infrastructure/repositories/password-reset-token.repository.js";

class AuthModule extends RestModule {
  // ============================================
  // Infrastructure Layer (External Services)
  // ============================================

  private readonly userRepository: IUserRepository;

  private readonly passwordService: IPasswordService;

  private readonly tokenService: ITokenService;

  private readonly passwordResetTokenRepository: IPasswordResetTokenRepository;

  private readonly emailService: IEmailService;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly registerUseCase: RegisterUseCase;

  private readonly loginUseCase: LoginUseCase;

  private readonly refreshTokenUseCase: RefreshTokenUseCase;

  private readonly forgotPasswordUseCase: ForgotPasswordUseCase;

  private readonly resetPasswordUseCase: ResetPasswordUseCase;

  // ============================================
  // Presentation Layer (Controller & Router)
  // ============================================

  private readonly controller: AuthController;

  private readonly decoratorRouter: DecoratorRouter;

  private readonly router: Router;

  constructor() {
    super({
      name: "AuthModule",
      description: "Module for authentication and authorization",
    });
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.tokenService = new JWTService();
    this.passwordResetTokenRepository = new PasswordResetTokenRepository();
    this.emailVerificationTokenRepository =
      new EmailVerificationTokenRepository();
    this.emailService = new MailgunEmailService();

    this.registerUseCase = new RegisterUseCase(
      this.userRepository,
      this.passwordService,
      this.emailService
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordService,
      this.tokenService
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.userRepository,
      this.tokenService
    );

    this.forgotPasswordUseCase = new ForgotPasswordUseCase(
      this.userRepository,
      this.passwordResetTokenRepository,
      this.emailService
    );

    this.resetPasswordUseCase = new ResetPasswordUseCase(
      this.passwordResetTokenRepository,
      this.userRepository,
      this.passwordService
    );

    this.controller = new AuthController(
      this.registerUseCase,
      this.loginUseCase,
      this.refreshTokenUseCase,
      this.forgotPasswordUseCase,
      this.resetPasswordUseCase
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
