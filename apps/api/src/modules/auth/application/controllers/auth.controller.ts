import { config } from "@packages/config";
import type { CookieOptions, Request, Response } from "express";
import { z } from "zod";
import { UnauthorizedError } from "../../../../shared/errors/index.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator.js";
import {
  RefreshTokenCookie,
  SetCookie,
} from "../../../../shared/infrastructure/decorators/rest/header.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator.js";
import {
  Get,
  Post,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators.js";
import { ValidateBody } from "../../../../shared/infrastructure/decorators/rest/validation.decorators.js";
import {
  conflictErrorResponseSchema,
  forbiddenErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  validationErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas.js";
import {
  createSuccessResponseSchema,
  successResponseSchema,
} from "../../../../shared/schemas/base/response.schemas.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import {
  type UserProfile,
  userProfileValidator,
} from "../../../users/application/validators/user.validator.js";
import { forgotPasswordValidator } from "../dto/request/forgot-password.dto.js";
import { loginValidator } from "../dto/request/login.dto.js";
import { registerValidator } from "../dto/request/register.dto.js";
import { resetPasswordValidator } from "../dto/request/reset-password.dto.js";
import { authResponseBodyValidator } from "../dto/response/auth-response.response.validator.js";
import type { RefreshTokenResponse } from "../dto/response/refresh-token.response.validator.js";
import { refreshTokenResponseBodyValidator } from "../dto/response/refresh-token.response.validator.js";
import type { ForgotPasswordUseCase } from "../use-cases/forgot-password.usecase.js";
import type { LoginUseCase } from "../use-cases/login.usecase.js";
import type { RefreshTokenUseCase } from "../use-cases/refresh-token.usecase.js";
import type { RegisterUseCase } from "../use-cases/register.usecase.js";
import type { ResendVerificationUseCase } from "../use-cases/resend-verification.usecase.js";
import type { ResetPasswordUseCase } from "../use-cases/reset-password.usecase.js";
import type { VerifyEmailUseCase } from "../use-cases/verify-email.usecase.js";

const isProduction = config.env.NODE_ENV === "production";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  domain: config.env.backend.cookieDomain,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: "lax",
  secure: isProduction,
  httpOnly: true,
};

const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  domain: config.env.backend.cookieDomain,
  maxAge: 15 * 60 * 1000,
  sameSite: "lax",
  secure: isProduction,
  httpOnly: true,
};

@Controller({
  tag: "Authentication",
  prefix: "/auth",
  description: "Authentication and user management endpoints",
})
export class AuthController extends BaseController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase
  ) {
    super();
  }

  @Post({
    path: "/register",
    summary: "Register a new user",
    description:
      "Create a new user account with email, username, and password. A verification email will be sent.",
  })
  @ValidateBody(registerValidator)
  @ApiResponse(
    201,
    "Registration successful — verification email sent",
    successResponseSchema
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(
    409,
    "Email or username already exists",
    conflictErrorResponseSchema
  )
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, username, password } = req.body;

      await this.registerUseCase.execute({
        email,
        username,
        password,
      });

      res.status(201).json({
        success: true,
        message:
          "Un email de vérification a été envoyé. Vérifiez votre boîte mail.",
      });
    }
  );

  @Post({
    path: "/login",
    summary: "Login user",
    description:
      "Authenticate user with email and password, receive access tokens",
  })
  @ValidateBody(loginValidator)
  @ApiResponse(
    200,
    "Login successful",
    createSuccessResponseSchema(authResponseBodyValidator)
  )
  @ApiResponse(400, "Invalid credentials", validationErrorResponseSchema)
  @ApiResponse(
    401,
    "Unauthorized - wrong email or password",
    unauthorizedErrorResponseSchema
  )
  @ApiResponse(403, "Email not verified", forbiddenErrorResponseSchema)
  @SetCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS)
  @SetCookie(ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_OPTIONS)
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const [result, refreshToken] = await this.loginUseCase.execute({
      email,
      password,
    });

    res.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    );
    res.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      result.accessToken,
      ACCESS_TOKEN_COOKIE_OPTIONS
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: result.user },
    });
  });

  @Post({
    path: "/refresh",
    summary: "Refresh access token",
    description:
      "Get new access and refresh tokens using a valid refresh token",
  })
  @RefreshTokenCookie()
  @ApiResponse(
    200,
    "Tokens refreshed successfully",
    createSuccessResponseSchema(refreshTokenResponseBodyValidator)
  )
  @ApiResponse(
    401,
    "Invalid or expired refresh token",
    unauthorizedErrorResponseSchema
  )
  @SetCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS)
  refresh = asyncHandler(
    async (req: Request, res: Response): Promise<RefreshTokenResponse> => {
      const { refreshToken: _refreshToken } = req.cookies;

      const [responseData, refreshToken] =
        await this.refreshTokenUseCase.execute({
          refreshToken: _refreshToken,
        });

      res.cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS
      );
      res.cookie(
        ACCESS_TOKEN_COOKIE_NAME,
        responseData.accessToken,
        ACCESS_TOKEN_COOKIE_OPTIONS
      );

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: { user: responseData.user },
      });
      return responseData;
    }
  );

  @Post({
    path: "/logout",
    summary: "Logout user",
    description: "Logout the current authenticated user (invalidate session)",
  })
  @Protected()
  @ApiResponse(200, "Logged out successfully", successResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    // TODO: Implement token invalidation/blacklisting
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      domain: config.env.backend.cookieDomain,
      sameSite: "lax",
      secure: isProduction,
      httpOnly: true,
    });
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
      domain: config.env.backend.cookieDomain,
      sameSite: "lax",
      secure: isProduction,
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });

  @Get({
    path: "/me",
    summary: "Get current user profile",
    description: "Get the authenticated user information from JWT token",
  })
  @Protected()
  @ApiResponse(
    200,
    "User profile retrieved successfully",
    createSuccessResponseSchema(userProfileValidator)
  )
  @ApiResponse(
    401,
    "Not authenticated - missing or invalid token",
    unauthorizedErrorResponseSchema
  )
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const userProfile: UserProfile = {
      userId: user.userId,
      email: user.email,
    };

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  });

  @Post({
    path: "/forgot-password",
    summary: "Request password reset",
    description:
      "Send a password reset email to the given address. Always returns 200 to prevent user enumeration.",
  })
  @ValidateBody(forgotPasswordValidator)
  @ApiResponse(
    200,
    "Password reset email sent (if email exists)",
    successResponseSchema
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  forgotPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await this.forgotPasswordUseCase.execute({ email: req.body.email });

      res.status(200).json({
        success: true,
        message:
          "If that email address is registered, you will receive a reset link shortly.",
      });
    }
  );

  @Post({
    path: "/reset-password",
    summary: "Reset password with token",
    description:
      "Reset the user password using a valid reset token from email.",
  })
  @ValidateBody(resetPasswordValidator)
  @ApiResponse(200, "Password reset successfully", successResponseSchema)
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(401, "Invalid or expired token", unauthorizedErrorResponseSchema)
  resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await this.resetPasswordUseCase.execute({
        token: req.body.token,
        newPassword: req.body.newPassword,
      });

      res.status(200).json({
        success: true,
        message: "Password reset successfully.",
      });
    }
  );

  @Post({
    path: "/verify-email",
    summary: "Verify email address",
    description:
      "Verify a user's email using the token received by email. Returns JWT tokens on success.",
  })
  @ValidateBody(z.object({ token: z.string().min(1) }))
  @ApiResponse(
    200,
    "Email verified successfully",
    createSuccessResponseSchema(authResponseBodyValidator)
  )
  @ApiResponse(401, "Invalid or expired token", unauthorizedErrorResponseSchema)
  @SetCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS)
  @SetCookie(ACCESS_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_OPTIONS)
  verifyEmail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { token } = req.body;

      const [result, refreshToken] = await this.verifyEmailUseCase.execute({
        token,
      });

      res.cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS
      );
      res.cookie(
        ACCESS_TOKEN_COOKIE_NAME,
        result.accessToken,
        ACCESS_TOKEN_COOKIE_OPTIONS
      );

      res.status(200).json({ success: true, data: { user: result.user } });
    }
  );

  @Post({
    path: "/resend-verification",
    summary: "Resend verification email",
    description:
      "Resend a verification email to an unverified user. Always returns 200 to prevent user enumeration.",
  })
  @ValidateBody(z.object({ email: z.string().email() }))
  @ApiResponse(200, "Email sent (if applicable)", successResponseSchema)
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  resendVerification = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      await this.resendVerificationUseCase.execute({ email: req.body.email });

      res.status(200).json({
        success: true,
        message:
          "Si ce compte existe et n'est pas vérifié, un email a été renvoyé.",
      });
    }
  );
}
