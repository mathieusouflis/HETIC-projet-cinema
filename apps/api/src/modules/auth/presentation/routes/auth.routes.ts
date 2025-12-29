import { Router } from "express";
import type { AuthController } from "../../application/controllers/auth.controller.js";
import { authMiddleware } from "../../../../shared/middleware/auth.middleware.js";
import { validateRequest } from "../../../../shared/middleware/validation.middleware.js";
import { registerSchema } from "../../application/validators/register.validator.js";
import { refreshTokenSchema } from "../../application/validators/refresh-token.validator.js";
import { loginSchema } from "../../application/validators/login.validator.js";

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  /**
   * @route   POST /auth/register
   * @desc    Register a new user account
   * @access  Public
   * @body    email - User's email address (required, valid email format)
   * @body    username - User's display name (required, 3-30 chars, alphanumeric)
   * @body    password - User's password (required, min 8 chars, uppercase, lowercase, number)
   * @returns User data and JWT tokens (access + refresh)
   */
  router.post(
    "/register",
    validateRequest(registerSchema, "body"),
    controller.register,
  );

  /**
   * @route   POST /auth/login
   * @desc    Authenticate user and get tokens
   * @access  Public
   * @body    email - User's email address (required)
   * @body    password - User's password (required)
   * @returns User data and JWT tokens (access + refresh)
   */
  router.post("/login", validateRequest(loginSchema, "body"), controller.login);

  /**
   * @route   POST /auth/refresh
   * @desc    Refresh access token using refresh token
   * @access  Public (requires valid refresh token in body)
   * @body    refreshToken - Valid refresh token (required)
   * @returns New JWT tokens (access + refresh)
   */
  router.post(
    "/refresh",
    validateRequest(refreshTokenSchema, "body"),
    controller.refresh,
  );

  /**
   * @route   POST /auth/logout
   * @desc    Logout the current user
   * @access  Private (requires valid access token)
   */
  router.post("/logout", authMiddleware, controller.logout);

  /**
   * @route   GET /auth/me
   * @desc    Get current authenticated user's basic info
   * @access  Private (requires valid access token)
   * @returns User ID and email from JWT payload
   */
  router.get("/me", authMiddleware, controller.getMe);

  return router;
}
