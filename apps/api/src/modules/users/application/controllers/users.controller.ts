import type { Request, Response } from "express";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../../../../shared/errors/index.js";
import { Shared } from "../../../../shared/index.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { Protected } from "../../../../shared/infrastructure/decorators/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/response.decorator.js";
import {
  Delete,
  Get,
  Patch,
  Post,
} from "../../../../shared/infrastructure/decorators/route.decorators.js";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/validation.decorators.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import {
  type CreateFrienshipParams,
  createFrienshipParamsValidator,
} from "../dto/requests/create-friendship.params.validator.js";
import {
  type DeleteFriendshipParams,
  deleteFriendshipParamsValidator,
} from "../dto/requests/delete-friendship.params.validator.js";
import { deleteIdParamsSchema } from "../dto/requests/delete-id.validator.js";
import {
  type GetQueryDTO,
  getQuerySchema,
} from "../dto/requests/get.validator.js";
import { getIdParamsSchema } from "../dto/requests/get-id.validator.js";
import {
  type GetUserFollowersParams,
  getUserFollowersParamsValidator,
} from "../dto/requests/get-user-followers.params.validator.js";
import {
  patchIdBodySchema,
  patchIdParamsSchema,
} from "../dto/requests/patch-id.validator.js";
import { patchMeBodySchema } from "../dto/requests/patch-me.validator.js";
import {
  type CreateFriendshipResponse,
  createFriendshipResponseValidator,
} from "../dto/response/create-friendship.response.validator.js";
import {
  type GetAllUsersResponse,
  getResponseSchema,
} from "../dto/response/get.response.validator.js";
import {
  type GetFollowersFollowingResponse,
  getFollowersFollowingResponseValidator,
} from "../dto/response/get-followers-following.response.validator.js";
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
import { toUserResponseDTO } from "../dto/utils/to-user-response.js";
import type { CreateFriendshipUseCase } from "../use-cases/create-friendship.use-case.js";
import type { DeleteUserUseCase } from "../use-cases/DeleteUser.usecase.js";
import type { DeleteFriendshipUseCase } from "../use-cases/delete-friendship.use-case.js";
import type { GetMeUseCase } from "../use-cases/GetMe.usecase.js";
import type { GetUserByIdUseCase } from "../use-cases/GetUserById.usecase.js";
import type { GetUsersUseCase } from "../use-cases/GetUsers.usecase.js";
import type { GetMyFollowingUseCase } from "../use-cases/get-my-following.use-case.js";
import type { GetUserFollowersUseCase } from "../use-cases/get-user-followers.use-case.js";
import type { GetUserFollowingUseCase } from "../use-cases/get-user-following.use-case.js";
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
    private readonly getMeUseCase: GetMeUseCase,

    /*
     * ========================================
     *           FOLLOWING FEATURE
     * ========================================
     */
    private readonly createFriendshipUseCase: CreateFriendshipUseCase,
    private readonly deleteFriendshipUseCase: DeleteFriendshipUseCase,
    private readonly getMyFollowingUseCase: GetMyFollowingUseCase,
    private readonly getUserFollowersUseCase: GetUserFollowersUseCase,
    private readonly getUserFollowingUseCase: GetUserFollowingUseCase
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

  /*
   * ========================================
   *           FOLLOWING FEATURE
   * ========================================
   */
  @Post({
    path: "/me/friendships/:id",
    summary: "Follow a user",
    description: "Follow a user",
  })
  @Protected()
  @ValidateParams(createFrienshipParamsValidator)
  @ApiResponse(
    201,
    "User followed successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(
      createFriendshipResponseValidator
    )
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
    "Cannot follow yourself",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    409,
    "User already followed",
    Shared.Schemas.Base.conflictErrorResponseSchema
  )
  @ApiResponse(
    404,
    "User not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  createFriendship = asyncHandler(
    async (req, res): Promise<CreateFriendshipResponse> => {
      const params = req.params as CreateFrienshipParams;
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (userId === params.id) {
        throw new ForbiddenError("Cannot follow yourself");
      }

      const friendship = await this.createFriendshipUseCase.execute(
        userId,
        params
      );

      res.status(201).json({
        success: true,
        data: friendship.toJSON(),
      });

      return friendship.toJSON();
    }
  );

  @Delete({
    path: "/me/friendships/:id",
    summary: "Unfollow a user",
    description: "Unfollow a user (delete friendship)",
  })
  @Protected()
  @ValidateParams(deleteFriendshipParamsValidator)
  @ApiResponse(204, "User unfollowed successfully")
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
    404,
    "User or friendship not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  deleteFriendship = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const params = req.params as DeleteFriendshipParams;
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      await this.deleteFriendshipUseCase.execute(userId, params.id);

      res.status(204).send();
    }
  );

  @Get({
    path: "/me/friendships",
    summary: "Get my following list",
    description:
      "Get the list of users that the authenticated user is following",
  })
  @Protected()
  @ApiResponse(
    200,
    "Following list retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(
      getFollowersFollowingResponseValidator
    )
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  getMyFollowing = asyncHandler(
    async (
      req: Request,
      res: Response
    ): Promise<GetFollowersFollowingResponse> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const following = await this.getMyFollowingUseCase.execute(userId);
      const followingDTO = following.map(toUserResponseDTO);

      res.status(200).json({
        success: true,
        data: followingDTO,
      });

      return followingDTO;
    }
  );

  @Get({
    path: "/:id/following",
    summary: "Get user's following list",
    description: "Get the list of users that a specific user is following",
  })
  @ValidateParams(getUserFollowersParamsValidator)
  @ApiResponse(
    200,
    "Following list retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(
      getFollowersFollowingResponseValidator
    )
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
  getUserFollowing = asyncHandler(
    async (
      req: Request,
      res: Response
    ): Promise<GetFollowersFollowingResponse> => {
      const params = req.params as GetUserFollowersParams;

      const following = await this.getUserFollowingUseCase.execute(params.id);
      const followingDTO = following.map(toUserResponseDTO);

      res.status(200).json({
        success: true,
        data: followingDTO,
      });

      return followingDTO;
    }
  );

  @Get({
    path: "/:id/followers",
    summary: "Get user's followers list",
    description: "Get the list of users following a specific user",
  })
  @ValidateParams(getUserFollowersParamsValidator)
  @ApiResponse(
    200,
    "Followers list retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(
      getFollowersFollowingResponseValidator
    )
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
  getUserFollowers = asyncHandler(
    async (
      req: Request,
      res: Response
    ): Promise<GetFollowersFollowingResponse> => {
      const params = req.params as GetUserFollowersParams;

      const followers = await this.getUserFollowersUseCase.execute(params.id);
      const followersDTO = followers.map(toUserResponseDTO);

      res.status(200).json({
        success: true,
        data: followersDTO,
      });

      return followersDTO;
    }
  );
}
