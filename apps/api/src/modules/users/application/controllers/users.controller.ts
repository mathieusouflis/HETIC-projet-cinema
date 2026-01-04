import type { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import type { GetUserByIdUseCase } from "../use-cases/GetUserById.usecase.js";
import type { GetUsersUseCase } from "../use-cases/GetUsers.usecase.js";
import type { UpdateUserUseCase } from "../use-cases/UpdateUser.usecase.js";
import type { DeleteUserUseCase } from "../use-cases/DeleteUser.usecase.js";
import {
  validationErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  forbiddenErrorResponseSchema,
  notFoundErrorResponseSchema,
  createSuccessResponse,
} from "../../../../shared/schemas/index.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { BaseController } from "../../../../shared/infrastructure/base/BaseController.js";
import {
  Delete,
  Get,
  Patch,
} from "../../../../shared/infrastructure/decorators/route.decorators.js";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import { Protected } from "../../../../shared/infrastructure/decorators/auth.decorator.js";
import { getIdParamsSchema } from "../dto/requests/get-id.validatror.js";
import { getIdResponseSchema } from "../dto/responses/get-id-response.js";
import { getResponseSchema } from "../dto/responses/get-response.js";
import {
  patchIdBodySchema,
  patchIdParamsSchema,
} from "../dto/requests/patch-id.validator.js";
import { patchIdResponseSchema } from "../dto/responses/patch-id-response.js";
import { deleteIdParamsSchema } from "../dto/requests/delete-id.validator.js";
import { getMeResponseSchema } from "../dto/responses/get-me-response.js";
import { patchMeResponseSchema } from "../dto/responses/patch-me-response.js";
import { patchMeBodySchema } from "../dto/requests/patch-me.validator.js";
import { GetQueryDTO, getQuerySchema } from "../dto/requests/get.validator.js";

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
  ) {
    super();
  }

  @Get({
    path: "/:id",
    summary: "Get user by ID",
    description: "Retrieve a user profile by their unique identifier",
  })
  @ValidateParams(getIdParamsSchema)
  @ApiResponse(
    200,
    "User retrieved successfully",
    createSuccessResponse(getIdResponseSchema),
  )
  @ApiResponse(400, "Invalid user ID", validationErrorResponseSchema)
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id!;

    const user = await this.getUserByIdUseCase.execute(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

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
    createSuccessResponse(getResponseSchema),
  )
  @ApiResponse(
    400,
    "Invalid pagination parameters",
    validationErrorResponseSchema,
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit, offset, sort } = req.query as unknown as GetQueryDTO;

    const result = await this.getUsersUseCase.execute({
      page,
      limit,
      offset,
      sort,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

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
    createSuccessResponse(patchIdResponseSchema),
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    403,
    "Forbidden - cannot update other users",
    forbiddenErrorResponseSchema,
  )
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id!;
    const updateData = req.body;

    const updatedUser = await this.updateUserUseCase.execute(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  });

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
    forbiddenErrorResponseSchema,
  )
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id!;

    await this.deleteUserUseCase.execute(id);

    res.status(204).send();
  });

  @Get({
    path: "/me",
    summary: "Get current user profile",
    description: "Retrieve the authenticated user own profile",
  })
  @Protected()
  @ApiResponse(
    200,
    "User profile retrieved successfully",
    createSuccessResponse(getMeResponseSchema),
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    createSuccessResponse(patchMeResponseSchema),
  )
  @ApiResponse(400, "Invalid input data", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
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
