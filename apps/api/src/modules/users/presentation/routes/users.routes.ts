import { Router } from "express";
import type { UsersController } from "../../application/controllers/users.controller.js";
import {
  authMiddleware,
  requireOwnership,
} from "../../../../shared/middleware/auth.middleware.js";
import { validateRequest } from "../../../../shared/middleware/validation.middleware.js";
import { updateUserSchema } from "../../application/validators/update-user.validator.js";
import { paginationSchema } from "../../application/validators/pagination.validator.js";
import { userIdParamSchema } from "../../application/validators/user-id-param.validator.js";

export function createUsersRouter(controller: UsersController): Router {
  const router = Router();

  /**
   * @route   GET /users
   * @desc    Get all users with pagination
   * @access  Private (authenticated users)
   * @query   page - Page number (default: 1)
   * @query   limit - Items per page (default: 10, max: 100)
   */
  router.get(
    "/",
    authMiddleware,
    validateRequest(paginationSchema, "query"),
    controller.getAll,
  );

  /**
   * @route   GET /users/me
   * @desc    Get the current authenticated user's profile
   * @access  Private (authenticated users)
   */
  router.get("/me", authMiddleware, controller.getMe);

  /**
   * @route   PATCH /users/me
   * @desc    Update the current authenticated user's profile
   * @access  Private (authenticated users)
   * @body    username - New username (optional)
   * @body    avatar - Avatar URL (optional)
   */
  router.patch(
    "/me",
    authMiddleware,
    validateRequest(updateUserSchema, "body"),
    controller.updateMe,
  );

  /**
   * @route   GET /users/:id
   * @desc    Get a user by their ID
   * @access  Public
   * @param   id - User's unique identifier
   */
  router.get(
    "/:id",
    validateRequest(userIdParamSchema, "params"),
    controller.getById,
  );

  /**
   * @route   PATCH /users/:id
   * @desc    Update a user's profile
   * @access  Private (own profile only)
   * @param   id - User's unique identifier
   * @body    username - New username (optional)
   * @body    avatar - Avatar URL (optional)
   */
  router.patch(
    "/:id",
    authMiddleware,
    validateRequest(userIdParamSchema, "params"),
    requireOwnership("id"),
    validateRequest(updateUserSchema, "body"),
    controller.update,
  );

  /**
   * @route   DELETE /users/:id
   * @desc    Delete a user
   * @access  Private (own account only)
   * @param   id - User's unique identifier
   */
  router.delete(
    "/:id",
    authMiddleware,
    validateRequest(userIdParamSchema, "params"),
    requireOwnership("id"),
    controller.delete,
  );

  return router;
}
