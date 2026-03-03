import type { Request, Response } from "express";
import { UnauthorizedError } from "../../../../shared/errors/index.js";
import { Shared } from "../../../../shared/index.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator.js";
import {
  Delete,
  Get,
  Patch,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators.js";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import { deleteIdParamsSchema } from "../dto/requests/delete-id.validator.js";
import {
  type GetQueryDTO,
  getQuerySchema,
} from "../dto/requests/get.validator.js";
import { getIdParamsSchema } from "../dto/requests/get-id.validator.js";
import {
  patchIdBodySchema,
  patchIdParamsSchema,
} from "../dto/requests/patch-id.validator.js";
import { patchMeBodySchema } from "../dto/requests/patch-me.validator.js";
import {
  type GetAllUsersResponse,
  getResponseSchema,
} from "../dto/response/get.response.validator.js";
import {
  type GetIdResponse,
  getIdResponseSchema,
} from "../dto/response/get-id.response.validator.js";
import {
  type GetMeResponse,
  getMeResponseSchema,
} from "../dto/response/get-me.response.validator.js";
import {
  type PatchIdResponse,
  patchIdResponseSchema,
} from "../dto/response/patch-id.response.validator.js";
import { patchMeResponseSchema } from "../dto/response/patch-me.response.validator.js";
import type { DeleteUserUseCase } from "../use-cases/DeleteUser.usecase.js";
import type { GetMeUseCase } from "../use-cases/GetMe.usecase.js";
import type { GetUserByIdUseCase } from "../use-cases/GetUserById.usecase.js";
import type { GetUsersUseCase } from "../use-cases/GetUsers.usecase.js";
import type { UpdateUserUseCase } from "../use-cases/UpdateUser.usecase.js";

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
    Shared.Schemas.Base.createSuccessResponseSchema(getMeResponseSchema)
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
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
    Shared.Schemas.Base.createSuccessResponseSchema(patchMeResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid input data",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    409,
    "Email or username already in use",
    Shared.Schemas.Base.conflictErrorResponseSchema
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
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
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
    Shared.Schemas.Base.createSuccessResponseSchema(getResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid pagination parameters",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
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
    Shared.Schemas.Base.createSuccessResponseSchema(getIdResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid user ID",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    404,
    "User not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
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
    Shared.Schemas.Base.createSuccessResponseSchema(patchIdResponseSchema)
  )
  @ApiResponse(
    400,
    "Invalid input data",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Forbidden - cannot update other users",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "User not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
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
  @ApiResponse(
    400,
    "Invalid user ID",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Forbidden - cannot delete other users",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "User not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id!;

    await this.deleteUserUseCase.execute(id);

    res.status(204).send();
  });
}
