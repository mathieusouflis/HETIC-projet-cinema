import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error";
import { BaseController } from "../../../../shared/infrastructure/base/controllers/base-controller";
import { Protected } from "../../../../shared/infrastructure/decorators/rest/auth.decorator";
import { Controller } from "../../../../shared/infrastructure/decorators/rest/controller.decorator";
import { ApiResponse } from "../../../../shared/infrastructure/decorators/rest/response.decorator";
import {
  Get,
  Post,
} from "../../../../shared/infrastructure/decorators/rest/route.decorators";
import {
  ValidateBody,
  ValidateParams,
} from "../../../../shared/infrastructure/decorators/rest/validation.decorators";
import {
  forbiddenErrorResponseSchema,
  notFoundErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  validationErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas";
import { createSuccessResponseSchema } from "../../../../shared/schemas/base/response.schemas";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  type ConversationParams,
  conversationParamsValidator,
} from "../dto/request/conversation-params.validator";
import {
  type CreateConversationBody,
  createConversationBodyValidator,
} from "../dto/request/create-conversation-body.validator";
import {
  conversationBasicSchema,
  conversationResponseSchema,
} from "../dto/response/conversation.response.validator";
import type { CreateConversationUseCase } from "../use-cases/create-conversation.use-case";
import type { GetConversationUseCase } from "../use-cases/get-conversation.use-case";
import type { GetConversationsUseCase } from "../use-cases/get-conversations.use-case";
import type { MarkConversationReadUseCase } from "../use-cases/mark-conversation-read.use-case";

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
    createSuccessResponseSchema(conversationResponseSchema.array())
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
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
    createSuccessResponseSchema(conversationBasicSchema)
  )
  @ApiResponse(400, "Invalid input", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not friends or self-DM", forbiddenErrorResponseSchema)
  @ApiResponse(404, "User not found", notFoundErrorResponseSchema)
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
    createSuccessResponseSchema(conversationResponseSchema)
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not a participant", forbiddenErrorResponseSchema)
  @ApiResponse(404, "Conversation not found", notFoundErrorResponseSchema)
  getConversation = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as ConversationParams;

    const conversation = await this.getConversationUseCase.execute(userId, id);

    res.status(200).json({
      success: true,
      data: conversation,
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
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not a participant", forbiddenErrorResponseSchema)
  @ApiResponse(404, "Conversation not found", notFoundErrorResponseSchema)
  markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const { id } = req.params as ConversationParams;

    await this.markConversationReadUseCase.execute(userId, id);

    res.status(204).send();
  });
}
