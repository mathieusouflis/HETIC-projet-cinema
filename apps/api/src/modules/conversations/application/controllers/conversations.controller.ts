import { UnauthorizedError } from "../../../../shared/errors/index.js";
import { Shared } from "../../../../shared/index.js";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller.js";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator.js";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator.js";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator.js";
import {
  Get,
  Post,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators.js";
import {
  ValidateBody,
  ValidateParams,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators.js";
import { asyncHandler } from "../../../../shared/utils/asyncHandler.js";
import {
  type ConversationParams,
  conversationParamsValidator,
} from "../dto/request/conversation-params.validator.js";
import {
  type CreateConversationBody,
  createConversationBodyValidator,
} from "../dto/request/create-conversation-body.validator.js";
import {
  conversationBasicSchema,
  conversationResponseSchema,
} from "../dto/response/conversation.response.validator.js";
import type { CreateConversationUseCase } from "../use-cases/create-conversation.use-case.js";
import type { GetConversationUseCase } from "../use-cases/get-conversation.use-case.js";
import type { GetConversationsUseCase } from "../use-cases/get-conversations.use-case.js";
import type { MarkConversationReadUseCase } from "../use-cases/mark-conversation-read.use-case.js";

@Controller({
  tag: "Conversations",
  prefix: "/conversations",
  description: "Direct-message conversations between friends",
})
export class ConversationsController extends BaseController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly markConversationReadUseCase: MarkConversationReadUseCase
  ) {
    super();
  }

  @Get({
    path: "/",
    summary: "List my conversations",
    description:
      "Get all conversations for the authenticated user, with unread counts and last message",
  })
  @Protected()
  @ApiResponse(
    200,
    "Conversations retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(
      conversationResponseSchema.array()
    )
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  getConversations = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const conversations = await this.getConversationsUseCase.execute(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  });

  @Post({
    path: "/",
    summary: "Create or get a direct conversation",
    description:
      "Create a 1-to-1 conversation with an accepted friend, or return the existing one",
  })
  @Protected()
  @ValidateBody(createConversationBodyValidator)
  @ApiResponse(
    201,
    "Conversation created",
    Shared.Schemas.Base.createSuccessResponseSchema(conversationBasicSchema)
  )
  @ApiResponse(
    400,
    "Invalid input",
    Shared.Schemas.Base.validationErrorResponseSchema
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Not friends or self-DM",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "User not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  createConversation = asyncHandler(async (req, res) => {
    const callerId = req.user?.userId;
    if (!callerId) throw new UnauthorizedError("Not authenticated");

    const { friendId } = req.body as CreateConversationBody;

    const conversation = await this.createConversationUseCase.execute(
      callerId,
      friendId
    );

    res.status(201).json({
      success: true,
      data: conversation.toJSON(),
    });
  });

  @Get({
    path: "/:id",
    summary: "Get a conversation by ID",
    description:
      "Retrieve a single conversation the authenticated user participates in",
  })
  @Protected()
  @ValidateParams(conversationParamsValidator)
  @ApiResponse(
    200,
    "Conversation retrieved successfully",
    Shared.Schemas.Base.createSuccessResponseSchema(conversationBasicSchema)
  )
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Not a participant",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Conversation not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  getConversation = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as ConversationParams;

    const conversation = await this.getConversationUseCase.execute(userId, id);

    res.status(200).json({
      success: true,
      data: conversation.toJSON(),
    });
  });

  @Post({
    path: "/:id/read",
    summary: "Mark conversation as read",
    description:
      "Mark all messages in a conversation as read for the authenticated user",
  })
  @Protected()
  @ValidateParams(conversationParamsValidator)
  @ApiResponse(204, "Conversation marked as read")
  @ApiResponse(
    401,
    "Not authenticated",
    Shared.Schemas.Base.unauthorizedErrorResponseSchema
  )
  @ApiResponse(
    403,
    "Not a participant",
    Shared.Schemas.Base.forbiddenErrorResponseSchema
  )
  @ApiResponse(
    404,
    "Conversation not found",
    Shared.Schemas.Base.notFoundErrorResponseSchema
  )
  markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as ConversationParams;

    await this.markConversationReadUseCase.execute(userId, id);

    res.status(204).send();
  });
}
