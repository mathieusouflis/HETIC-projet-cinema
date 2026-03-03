import {
  ForbiddenError,
  UnauthorizedError,
} from "../../../../shared/errors/index.js";
import { Shared } from "../../../../shared/index.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator.js";
import {
  Delete,
  Get,
  Patch,
  Post,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators.js";
import {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import {
  type FriendshipIdParams,
  friendshipIdParamsValidator,
} from "../dto/request/friendship-id-params.validator.js";
import {
  type GetFriendshipsQuery,
  getFriendshipsQueryValidator,
} from "../dto/request/get-friendships-query.validator.js";
import {
  type UpdateFriendshipBody,
  updateFriendshipBodyValidator,
} from "../dto/request/update-friendship-body.validator.js";
import {
  type UserIdParams,
  userIdParamsValidator,
} from "../dto/request/user-id-params.validator.js";
import { friendshipResponseValidator } from "../dto/response/friendship.response.validator.js";
import type { GetMyFriendshipsUseCase } from "../use-cases/get-my-friendships.use-case.js";
import type { RemoveFriendshipUseCase } from "../use-cases/remove-friendship.use-case.js";
import type { RespondToFriendRequestUseCase } from "../use-cases/respond-to-friend-request.use-case.js";
import type { SendFriendRequestUseCase } from "../use-cases/send-friend-request.use-case.js";

@Controller({
  tag: "Friendships",
  prefix: "/friendships",
  description: "Friendship management (send / accept / reject / remove)",
})
export class FriendshipsController extends BaseController {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly respondToFriendRequestUseCase: RespondToFriendRequestUseCase,
    private readonly removeFriendshipUseCase: RemoveFriendshipUseCase,
    private readonly getMyFriendshipsUseCase: GetMyFriendshipsUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    summary: "List my friendships",
    description:
      "Get all friendships for the authenticated user, optionally filtered by status",
  })
  @Protected()
  @ValidateQuery(getFriendshipsQueryValidator)
  @ApiResponse(
    200,
    "Friendships retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(
      friendshipResponseValidator.array()
    )
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  getMyFriendships = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const { status } = req.query as GetFriendshipsQuery;
    const friendships = await this.getMyFriendshipsUseCase.execute(
      userId,
      status
    );

    res.status(200).json({
      success: true,
      data: friendships.map((f) => f.toJSON()),
    });
  });

  @Post({
    path: "/:userId",
    summary: "Send a friend request",
    description: "Send a friend request to another user",
  })
  @Protected()
  @ValidateParams(userIdParamsValidator)
  @ApiResponse(
    201,
    "Friend request sent",
    Shared.Schemas.Base.createSuccessResponseSchema(friendshipResponseValidator)
  )
  @ApiResponse(
    400,
    "Bad request",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Cannot send request to yourself",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "User not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  @ApiResponse(
    409,
    "Friendship already exists",
    Shared.Schemas.Base.conflictErrorResponseSchema
  )
  sendFriendRequest = asyncHandler(async (req, res) => {
    const callerId = req.user?.userId;
    if (!callerId) throw new UnauthorizedError("Not authenticated");

    const { userId } = req.params as UserIdParams;

    if (callerId === userId) {
      throw new ForbiddenError("Cannot send a friend request to yourself");
    }

    const friendship = await this.sendFriendRequestUseCase.execute(
      callerId,
      userId
    );

    res.status(201).json({
      success: true,
      data: friendship.toJSON(),
    });
  });

  @Patch({
    path: "/:id",
    summary: "Accept or reject a friend request",
    description: "Accept or reject a pending friend request (recipient only)",
  })
  @Protected()
  @ValidateParams(friendshipIdParamsValidator)
  @ValidateBody(updateFriendshipBodyValidator)
  @ApiResponse(
    200,
    "Friend request updated",
    Shared.Schemas.Base.createSuccessResponseSchema(friendshipResponseValidator)
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Only the recipient can respond",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Friendship not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  respondToFriendRequest = asyncHandler(async (req, res) => {
    const callerId = req.user?.userId;
    if (!callerId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as FriendshipIdParams;
    const { status } = req.body as UpdateFriendshipBody;

    const friendship = await this.respondToFriendRequestUseCase.execute(
      callerId,
      id,
      status
    );

    res.status(200).json({
      success: true,
      data: friendship.toJSON(),
    });
  });

  @Delete({
    path: "/:id",
    summary: "Remove a friendship",
    description: "Remove an accepted friendship or cancel a pending request",
  })
  @Protected()
  @ValidateParams(friendshipIdParamsValidator)
  @ApiResponse(204, "Friendship removed")
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Not part of this friendship",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Friendship not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  removeFriendship = asyncHandler(async (req, res) => {
    const callerId = req.user?.userId;
    if (!callerId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as FriendshipIdParams;

    await this.removeFriendshipUseCase.execute(callerId, id);

    res.status(204).send();
  });
}
