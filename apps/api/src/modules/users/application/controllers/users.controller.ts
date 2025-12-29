import type { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import type { GetUserByIdUseCase } from "../use-cases/GetUserById.usecase.js";
import type { GetUsersUseCase } from "../use-cases/GetUsers.usecase.js";
import type { UpdateUserUseCase } from "../use-cases/UpdateUser.usecase.js";
import type { DeleteUserUseCase } from "../use-cases/DeleteUser.usecase.js";

/**
 * Users Controller
 *
 * Handles HTTP requests for user-related endpoints
 * Following Single Responsibility Principle:
 * - Controller only handles HTTP concerns (request/response)
 * - Business logic is delegated to use cases
 *
 * Following Dependency Inversion Principle:
 * - Depends on use case interfaces, not concrete implementations
 * - Use cases are injected via constructor
 *
 * @example
 * ```ts
 * const controller = new UsersController(
 *   getUserByIdUseCase,
 *   getUsersUseCase,
 *   updateUserUseCase,
 *   deleteUserUseCase
 * );
 * ```
 */
export class UsersController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * Get a user by ID
   *
   * @route GET /users/:id
   * @access Public
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const user = await this.getUserByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Get all users with pagination
   *
   * @route GET /users
   * @access Private (authenticated users)
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const result = await this.getUsersUseCase.execute({ page, limit });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Update a user's profile
   *
   * @route PATCH /users/:id
   * @access Private (own profile or admin)
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    const updateData = req.body;
    const updatedUser = await this.updateUserUseCase.execute(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  });

  /**
   * Delete a user
   *
   * @route DELETE /users/:id
   * @access Private (admin only or own account)
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }

    await this.deleteUserUseCase.execute(id);

    res.status(204).send();
  });

  /**
   * Get the current authenticated user's profile
   *
   * @route GET /users/me
   * @access Private (authenticated users)
   */
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // req.user is set by authMiddleware
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    const user = await this.getUserByIdUseCase.execute(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Update the current authenticated user's profile
   *
   * @route PATCH /users/me
   * @access Private (authenticated users)
   */
  updateMe = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
        return;
      }

      const updateData = req.body;
      const updatedUser = await this.updateUserUseCase.execute(
        userId,
        updateData,
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    },
  );
}
