import type { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import type { RefreshTokenUseCase } from "../use-cases/refresh-token.usecase.js";
import { RegisterUseCase } from "../use-cases/register.usecase.js";
import { LoginUseCase } from "../use-cases/login.usecase.js";

/**
 * Auth Controller
 */
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  /**
   * Register a new user
   *
   * @route POST /auth/register
   * @access Public
   * @body email - User's email address
   * @body username - User's display name
   * @body password - User's password (min 8 chars, must contain uppercase, lowercase, number)
   */
  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, username, password } = req.body;

      const result = await this.registerUseCase.execute({
        email,
        username,
        password,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    },
  );

  /**
   * Login an existing user
   *
   * @route POST /auth/login
   * @access Public
   * @body email - User's email address
   * @body password - User's password
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await this.loginUseCase.execute({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });

  /**
   * Refresh authentication tokens
   *
   * @route POST /auth/refresh
   * @access Public (requires valid refresh token)
   * @body refreshToken - Valid refresh token
   */
  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    const result = await this.refreshTokenUseCase.execute({
      refreshToken,
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: result,
    });
  });

  /**
   * Logout the current user
   *
   * @route POST /auth/logout
   * @access Private (requires authentication)
   *
   */
  logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });

  /**
   * Get the current authenticated user's information
   *
   * @route GET /auth/me
   * @access Private (requires authentication)
   */
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
        email: user.email,
      },
    });
  });
}
