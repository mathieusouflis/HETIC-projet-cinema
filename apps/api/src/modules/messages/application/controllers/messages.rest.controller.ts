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
  forbiddenErrorResponseSchema,
  notFoundErrorResponseSchema,
  unauthorizedErrorResponseSchema,
  validationErrorResponseSchema,
} from "../../../../shared/schemas/base/error.schemas";
import { createSuccessResponseSchema } from "../../../../shared/schemas/base/response.schemas";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  type ConversationIdParams,
  conversationIdParamsValidator,
} from "../dto/rest/request/conversation-id-params.validator";
import {
  type EditMessageBody,
  editMessageBodyValidator,
} from "../dto/rest/request/edit-message-body.validator";
import {
  type GetMessagesQuery,
  getMessagesQueryValidator,
} from "../dto/rest/request/get-messages-query.validator";
import {
  type MessageIdParams,
  messageIdParamsValidator,
} from "../dto/rest/request/message-id-params.validator";
import {
  type SendMessageBody,
  sendMessageBodyValidator,
} from "../dto/rest/request/send-message-body.validator";
import {
  messagePageResponseSchema,
  messageResponseSchema,
} from "../dto/rest/response/message.response.validator";
import type { DeleteMessageUseCase } from "../use-cases/delete-message.use-case";
import type { EditMessageUseCase } from "../use-cases/edit-message.use-case";
import type { GetMessagesUseCase } from "../use-cases/get-messages.use-case";
import type { SendMessageUseCase } from "../use-cases/send-message.use-case";

@Controller({
  tag: "Messages",
  prefix: "/messages",
  description: "Messages management (REST)",
})
export class MessagesRestController extends BaseController {
  constructor(
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase
  ) {
    super();
  }

  @Get({
    path: "/conversations/:conversationId",
    summary: "Get messages for a conversation",
    description:
      "Get paginated messages for a conversation using cursor-based pagination",
  })
  @Protected()
  @ValidateParams(conversationIdParamsValidator)
  @ValidateQuery(getMessagesQueryValidator)
  @ApiResponse(
    200,
    "Messages retrieved successfully",
    createSuccessResponseSchema(messagePageResponseSchema)
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not a participant", forbiddenErrorResponseSchema)
  getMessages = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { conversationId } = req.params as ConversationIdParams;
    const { cursor, limit } = req.query as GetMessagesQuery;

    const page = await this.getMessagesUseCase.execute(
      userId,
      conversationId,
      cursor,
      limit
    );

    res.status(200).json({
      success: true,
      data: {
        items: page.items.map((m) => m.toJSON()),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
      },
    });
  });

  @Post({
    path: "/conversations/:conversationId",
    summary: "Send a message",
    description: "Send a text message in a conversation",
  })
  @Protected()
  @ValidateParams(conversationIdParamsValidator)
  @ValidateBody(sendMessageBodyValidator)
  @ApiResponse(
    201,
    "Message sent",
    createSuccessResponseSchema(messageResponseSchema)
  )
  @ApiResponse(400, "Invalid input", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not a participant", forbiddenErrorResponseSchema)
  sendMessage = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { conversationId } = req.params as ConversationIdParams;
    const { content } = req.body as SendMessageBody;

    const message = await this.sendMessageUseCase.execute(
      userId,
      conversationId,
      content
    );

    res.status(201).json({
      success: true,
      data: message.toJSON(),
    });
  });

  @Patch({
    path: "/:messageId",
    summary: "Edit a message",
    description: "Edit the content of a message (author only)",
  })
  @Protected()
  @ValidateParams(messageIdParamsValidator)
  @ValidateBody(editMessageBodyValidator)
  @ApiResponse(
    200,
    "Message updated",
    createSuccessResponseSchema(messageResponseSchema)
  )
  @ApiResponse(400, "Invalid input", validationErrorResponseSchema)
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(
    403,
    "Not the author or message deleted",
    forbiddenErrorResponseSchema
  )
  @ApiResponse(404, "Message not found", notFoundErrorResponseSchema)
  editMessage = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { messageId } = req.params as MessageIdParams;
    const { content } = req.body as EditMessageBody;

    const message = await this.editMessageUseCase.execute(
      userId,
      messageId,
      content
    );

    res.status(200).json({
      success: true,
      data: message.toJSON(),
    });
  });

  @Delete({
    path: "/:messageId",
    summary: "Delete a message",
    description:
      "Soft-delete a message (author only) — replaced by a tombstone",
  })
  @Protected()
  @ValidateParams(messageIdParamsValidator)
  @ApiResponse(
    200,
    "Message deleted (tombstone returned)",
    createSuccessResponseSchema(messageResponseSchema)
  )
  @ApiResponse(401, "Not authenticated", unauthorizedErrorResponseSchema)
  @ApiResponse(403, "Not the author", forbiddenErrorResponseSchema)
  @ApiResponse(404, "Message not found", notFoundErrorResponseSchema)
  deleteMessage = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedError("Not authenticated");
    }

    const { messageId } = req.params as MessageIdParams;

    const message = await this.deleteMessageUseCase.execute(userId, messageId);

    res.status(200).json({
      success: true,
      data: message.toJSON(),
    });
  });
}
