import type { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import type { RefreshTokenUseCase } from "../use-cases/refresh-token.usecase.js";
import { RegisterUseCase } from "../use-cases/register.usecase.js";
import { LoginUseCase } from "../use-cases/login.usecase.js";

import { registerValidator } from "../dto/request/register.dto.js";
import { loginValidator } from "../dto/request/login.dto.js";
import {
  authResponseDataValidator,
  AuthResponseDTO,
} from "../dto/response/auth-response.dto.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/BaseController.js";
import {
  Get,
  Post,
} from "../../../../shared/infrastructure/decorators/route.decorators.js";
import { ValidateBody } from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Protected } from "../../../../shared/infrastructure/decorators/auth.decorator.js";
import {
  RefreshTokenCookie,
  SetCookie,
} from "../../../../shared/infrastructure/decorators/header.decorator.js";
import {
  UserProfile,
  userProfileSchema,
} from "../../../users/application/schema/user.schema.js";
import { config } from "@packages/config";
import { RefreshTokenResponseDTO } from "../dto/response/refresh-token-response.dto.js";
import { createSuccessResponse, successResponseSchema } from "../../../../shared/schemas/base/response.schemas.js";
import { conflictErrorResponseSchema, unauthorizedErrorResponseSchema, validationErrorResponseSchema } from "../../../../shared/schemas/base/error.schemas.js";

const cookieName = "refreshToken";
const cookiesOptions = {
  domain: config.env.backend.host,
  maxAge: 7 * 24 * 60 * 60,
  sameSite: "strict",
  secure: config.env.NODE_ENV === "production",
} as const;

function returnRefreshTokenCookie(refreshToken: string, res: Response) {
  res.cookie(cookieName, refreshToken, cookiesOptions);
}

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
  ) {
    super();
  }

  @Post({
    path: "/register",
    summary: "Register a new user",
    description: "Create a new user account with email, username, and password",
  })
  @ValidateBody(registerValidator)
  @ApiResponse(
    201,
    "User registered successfully",
    createSuccessResponse(authResponseDataValidator),
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(
    409,
    "Email or username already exists",
    conflictErrorResponseSchema,
  )
  @SetCookie(cookieName, cookiesOptions)
  register = asyncHandler(
    async (req: Request, res: Response): Promise<AuthResponseDTO> => {
      const { email, username, password } = req.body;

      const [result, refreshToken] = await this.registerUseCase.execute({
        email,
        username,
        password,
      });

      returnRefreshTokenCookie(refreshToken, res);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });

      return result;
    },
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
    createSuccessResponse(authResponseDataValidator),
  )
  @ApiResponse(400, "Invalid credentials", validationErrorResponseSchema)
  @ApiResponse(
    401,
    "Unauthorized - wrong email or password",
    unauthorizedErrorResponseSchema,
  )
  @SetCookie(cookieName, cookiesOptions)
  login = asyncHandler(
    async (req: Request, res: Response): Promise<AuthResponseDTO> => {
      const { email, password } = req.body;

      const [result, refreshToken] = await this.loginUseCase.execute({
        email,
        password,
      });

      returnRefreshTokenCookie(refreshToken, res);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });

      return result;
    },
  );

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
    createSuccessResponse(authResponseDataValidator),
  )
  @ApiResponse(
    401,
    "Invalid or expired refresh token",
    unauthorizedErrorResponseSchema,
  )
  @SetCookie(cookieName, cookiesOptions)
  refresh = asyncHandler(
    async (req: Request, res: Response): Promise<RefreshTokenResponseDTO> => {
      const { refreshToken: _refreshToken } = req.cookies;

      const [accessToken, refreshToken] =
        await this.refreshTokenUseCase.execute({
          refreshToken: _refreshToken,
        });

      returnRefreshTokenCookie(refreshToken, res);

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: accessToken,
      });

      return accessToken;
    },
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
    createSuccessResponse(userProfileSchema),
  )
  @ApiResponse(
    401,
    "Not authenticated - missing or invalid token",
    unauthorizedErrorResponseSchema,
  )
  getMe = asyncHandler(
    async (req: Request, res: Response): Promise<UserProfile | void> => {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const userProfile: UserProfile = {
        userId: user.userId,
        email: user.email,
      };

      res.status(200).json({
        success: true,
        data: userProfile,
      });

      return userProfile;
    },
  );
}
