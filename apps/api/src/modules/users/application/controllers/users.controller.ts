import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator";
import {
  Delete,
  Get,
  Patch,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators";
import {
  conflictErrorResponseSchema,
  forbiddenErrorResponseSchema,
  notFoundErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  validationErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas";
import { createSuccessResponseSchema } from "../../../../shared/schemas/base/response.schemas";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { deleteIdParamsSchema } from "../dto/requests/delete-id.validator";
import {
  type GetQueryDTO,
  getQuerySchema,
} from "../dto/requests/get.validator";
import { getIdParamsSchema } from "../dto/requests/get-id.validator";
import {
  patchIdBodySchema,
  patchIdParamsSchema,
} from "../dto/requests/patch-id.validator";
import { patchMeBodySchema } from "../dto/requests/patch-me.validator";
import {
  type GetAllUsersResponse,
  getResponseSchema,
} from "../dto/response/get.response.validator";
import {
  type GetIdResponse,
  getIdResponseSchema,
} from "../dto/response/get-id.response.validator";
import {
  type GetMeResponse,
  getMeResponseSchema,
} from "../dto/response/get-me.response.validator";
import {
  type PatchIdResponse,
  patchIdResponseSchema,
} from "../dto/response/patch-id.response.validator";
import { patchMeResponseSchema } from "../dto/response/patch-me.response.validator";
import type { DeleteUserUseCase } from "../use-cases/DeleteUser.usecase";
import type { GetMeUseCase } from "../use-cases/GetMe.usecase";
import type { GetUserByIdUseCase } from "../use-cases/GetUserById.usecase";
import type { GetUsersUseCase } from "../use-cases/GetUsers.usecase";
import type { UpdateUserUseCase } from "../use-cases/UpdateUser.usecase";

@Controller({
  tag: "Users",
  prefix: "/users",
  description: "User management and profile endpoints",
})
export class UsersController extends BaseController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getMeUseCase: GetMeUseCase
  ) {
    super();
  }

  /*
   * ========================================
   *   /me routes — MUST come before /:id
   *   so Express does not treat "me" as an id
   * ========================================
   */

  @Get({
    path: "/me",
    summary: "Get current user profile",
    description: "Retrieve the authenticated user own profile",
  })
  @Protected()
  @ApiResponse(
    200,
    "User profile retrieved successfully",
    createSuccessResponseSchema(getMeResponseSchema)
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  getMe = asyncHandler(
    async (req: Request, res: Response): Promise<GetMeResponse> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const user = await this.getMeUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: user,
      });

      return user;
    }
  );

  @Patch({
    path: "/me",
    summary: "Update current user profile",
    description: "Update the authenticated user own profile",
  })
  @Protected()
  @ValidateBody(patchMeBodySchema)
  @ApiResponse(
    200,
    "User profile updated successfully",
    createSuccessResponseSchema(patchMeResponseSchema)
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    409,
    "Email or username already in use",
    conflictErrorResponseSchema
  )
  updateMe = asyncHandler(
    async (req: Request, res: Response): Promise<PatchIdResponse> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const updateData = req.body;
      const updatedUser = await this.updateUserUseCase.execute(
        userId,
        updateData
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
      });

      return updatedUser;
    }
  );

  @Delete({
    path: "/me",
    summary: "Delete current user account",
    description: "Permanently delete the authenticated user own account",
  })
  @Protected()
  @ApiResponse(204, "User account deleted successfully")
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  deleteMe = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      await this.deleteUserUseCase.execute(userId);

      res.status(204).send();
    }
  );

  /*
   * ========================================
   *   Collection + /:id routes — after /me
   * ========================================
   */

  @Get({
    path: "/",
    summary: "Get all users",
    description: "Retrieve a paginated list of all users",
  })
  @Protected()
  @ValidateQuery(getQuerySchema)
  @ApiResponse(
    200,
    "Users retrieved successfully",
    createSuccessResponseSchema(getResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid pagination parameters",
    validationErrorResponseSchema
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  getAll = asyncHandler(
    async (req: Request, res: Response): Promise<GetAllUsersResponse> => {
      const { page, limit, offset } = req.query as GetQueryDTO;

      const result = await this.getUsersUseCase.execute({
        page,
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: result,
      });

      return result;
    }
  );

  @Get({
    path: "/:id",
    summary: "Get user by ID",
    description: "Retrieve a user profile by their unique identifier",
  })
  @ValidateParams(getIdParamsSchema)
  @ApiResponse(
    200,
    "User retrieved successfully",
    createSuccessResponseSchema(getIdResponseSchema)
  )
  @ApiResponse(400, "Invalid user ID", validationErrorResponseSchema)
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  getById = asyncHandler(
    async (req: Request, res: Response): Promise<GetIdResponse> => {
      const id = req.params.id!;

      const user = await this.getUserByIdUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: user,
      });

      return user;
    }
  );

  @Patch({
    path: "/:id",
    summary: "Update user profile",
    description: "Update a user profile (admin only or own profile)",
  })
  @Protected()
  @ValidateParams(patchIdParamsSchema)
  @ValidateBody(patchIdBodySchema)
  @ApiResponse(
    200,
    "User updated successfully",
    createSuccessResponseSchema(patchIdResponseSchema)
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    403,
    "Forbidden - cannot update other users",
    forbiddenErrorResponseSchema
  )
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  update = asyncHandler(
    async (req: Request, res: Response): Promise<PatchIdResponse> => {
      const id = req.params.id!;
      const updateData = req.body;

      const updatedUser = await this.updateUserUseCase.execute(id, updateData);

      res.status(200).json({
        success: true,
        data: updatedUser,
      });

      return updatedUser;
    }
  );

  @Delete({
    path: "/:id",
    summary: "Delete user",
    description: "Delete a user account (admin only or own account)",
  })
  @Protected()
  @ValidateParams(deleteIdParamsSchema)
  @ApiResponse(204, "User deleted successfully")
  @ApiResponse(400, "Invalid user ID", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    403,
    "Forbidden - cannot delete other users",
    forbiddenErrorResponseSchema
  )
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id!;

    await this.deleteUserUseCase.execute(id);

    res.status(204).send();
  });
}
