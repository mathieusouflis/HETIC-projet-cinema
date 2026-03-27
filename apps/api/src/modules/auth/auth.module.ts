import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import type { IEmailService } from "../../shared/services/email/i-email-service";
import { MailgunEmailService } from "../../shared/services/email/mailgun.service";
import type { IPasswordService } from "../../shared/services/password/i-password-service";
import { PasswordService } from "../../shared/services/password/password-service";
import type { ITokenService } from "../../shared/services/token/i-token-service";
import { JWTService } from "../../shared/services/token/jwt-service";
import type { IUserRepository } from "../users/domain/interfaces/IUserRepository";
import { UserRepository } from "../users/infrastructure/database/repositories/user.repository";
import { AuthController } from "./application/controllers/auth.controller";
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.usecase";
import { LoginUseCase } from "./application/use-cases/login.usecase";
import { LogoutUseCase } from "./application/use-cases/logout.usecase";
import { RefreshTokenUseCase } from "./application/use-cases/refresh-token.usecase";
import { RegisterUseCase } from "./application/use-cases/register.usecase";
import { ResendVerificationUseCase } from "./application/use-cases/resend-verification.usecase";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.usecase";
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.usecase";
import type { IEmailVerificationTokenRepository } from "./domain/interfaces/IEmailVerificationTokenRepository";
import type { IPasswordResetTokenRepository } from "./domain/interfaces/IPasswordResetTokenRepository";
import type { IRefreshTokenRepository } from "./domain/interfaces/IRefreshTokenRepository";
import { EmailVerificationTokenRepository } from "./infrastructure/repositories/email-verification-token.repository";
import { PasswordResetTokenRepository } from "./infrastructure/repositories/password-reset-token.repository";
import { RefreshTokenRepository } from "./infrastructure/repositories/refresh-token.repository";

class AuthModule extends RestModule {
  // ============================================
  // Infrastructure Layer (External Services)
  // ============================================

  private readonly userRepository: IUserRepository;

  private readonly passwordService: IPasswordService;

  private readonly tokenService: ITokenService;

  private readonly passwordResetTokenRepository: IPasswordResetTokenRepository;

  private readonly emailVerificationTokenRepository: IEmailVerificationTokenRepository;

  private readonly refreshTokenRepository: IRefreshTokenRepository;

  private readonly emailService: IEmailService;

  // ============================================
  // Application Layer (Use Cases)
  // ============================================

  private readonly registerUseCase: RegisterUseCase;

  private readonly loginUseCase: LoginUseCase;

  private readonly refreshTokenUseCase: RefreshTokenUseCase;

  private readonly logoutUseCase: LogoutUseCase;

  private readonly forgotPasswordUseCase: ForgotPasswordUseCase;

  private readonly resetPasswordUseCase: ResetPasswordUseCase;

  private readonly verifyEmailUseCase: VerifyEmailUseCase;

  private readonly resendVerificationUseCase: ResendVerificationUseCase;

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
    this.refreshTokenRepository = new RefreshTokenRepository();
    this.emailService = new MailgunEmailService();

    this.registerUseCase = new RegisterUseCase(
      this.userRepository,
      this.passwordService,
      this.emailVerificationTokenRepository,
      this.emailService
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordService,
      this.tokenService,
      this.refreshTokenRepository
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.userRepository,
      this.tokenService,
      this.refreshTokenRepository
    );

    this.logoutUseCase = new LogoutUseCase(this.refreshTokenRepository);

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

    this.verifyEmailUseCase = new VerifyEmailUseCase(
      this.emailVerificationTokenRepository,
      this.userRepository,
      this.tokenService,
      this.emailService,
      this.refreshTokenRepository
    );

    this.resendVerificationUseCase = new ResendVerificationUseCase(
      this.emailVerificationTokenRepository,
      this.userRepository,
      this.emailService
    );

    this.controller = new AuthController(
      this.registerUseCase,
      this.loginUseCase,
      this.refreshTokenUseCase,
      this.logoutUseCase,
      this.forgotPasswordUseCase,
      this.resetPasswordUseCase,
      this.verifyEmailUseCase,
      this.resendVerificationUseCase
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
