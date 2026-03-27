import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator";
import {
  Delete,
  Get,
  Patch,
  Post,
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
import {
  type FriendshipIdParams,
  friendshipIdParamsValidator,
} from "../dto/request/friendship-id-params.validator";
import {
  type GetFriendshipsQuery,
  getFriendshipsQueryValidator,
} from "../dto/request/get-friendships-query.validator";
import {
  type UpdateFriendshipBody,
  updateFriendshipBodyValidator,
} from "../dto/request/update-friendship-body.validator";
import {
  type UserIdParams,
  userIdParamsValidator,
} from "../dto/request/user-id-params.validator";
import { friendshipResponseValidator } from "../dto/response/friendship.response.validator";
import type { GetMyFriendshipsUseCase } from "../use-cases/get-my-friendships.use-case";
import type { RemoveFriendshipUseCase } from "../use-cases/remove-friendship.use-case";
import type { RespondToFriendRequestUseCase } from "../use-cases/respond-to-friend-request.use-case";
import type { SendFriendRequestUseCase } from "../use-cases/send-friend-request.use-case";

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
    createSuccessResponseSchema(friendshipResponseValidator.array())
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
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
    createSuccessResponseSchema(friendshipResponseValidator)
  )
  @ApiResponse(400, "Bad request", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    403,
    "Cannot send request to yourself",
    forbiddenErrorResponseSchema
  )
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
  @ApiResponse(409, "Friendship already exists", conflictErrorResponseSchema)
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
    createSuccessResponseSchema(friendshipResponseValidator)
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    403,
    "Only the recipient can respond",
    forbiddenErrorResponseSchema
  )
  @ApiResponse(404, "Friendship not found", notFoundErrorResponseSchema)
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
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not part of this friendship", forbiddenErrorResponseSchema)
  @ApiResponse(404, "Friendship not found", notFoundErrorResponseSchema)
  removeFriendship = asyncHandler(async (req, res) => {
    const callerId = req.user?.userId;
    if (!callerId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as FriendshipIdParams;

    await this.removeFriendshipUseCase.execute(callerId, id);

    res.status(204).send();
  });
}
