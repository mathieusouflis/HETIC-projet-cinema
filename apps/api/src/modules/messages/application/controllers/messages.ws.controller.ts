import type { Socket } from "socket.io";
import { WebSocketController } from "../../../../shared/infrastructure/base/controllers/web-socket-controller.js";
import { BroadcastTo } from "../../../../shared/infrastructure/decorators/web-socket/broadcast-to.decorator.js";
import { JoinRoom } from "../../../../shared/infrastructure/decorators/web-socket/join-room.decorator.js";
import { Namespace } from "../../../../shared/infrastructure/decorators/web-socket/namespace.decorator.js";
import { Publish } from "../../../../shared/infrastructure/decorators/web-socket/publish.decorator.js";
import { RequireSocketAuth } from "../../../../shared/infrastructure/decorators/web-socket/socket-auth.decorator.js";
import { Subscribe } from "../../../../shared/infrastructure/decorators/web-socket/subscribe.decorator.js";
import { ValidateEvent } from "../../../../shared/infrastructure/decorators/web-socket/validate-event.decorator.js";
import type { JoinConversationEvent } from "../dto/ws/join-conversation-event.validator.js";
import { joinConversationEventValidator } from "../dto/ws/join-conversation-event.validator.js";
import type { SendMessageEvent } from "../dto/ws/send-message-event.validator.js";
import { sendMessageEventValidator } from "../dto/ws/send-message-event.validator.js";
import type { TypingEvent } from "../dto/ws/typing-event.validator.js";
import { typingEventValidator } from "../dto/ws/typing-event.validator.js";
import type { SendMessageUseCase } from "../use-cases/send-message.use-case.js";

@RequireSocketAuth
@Namespace({
  path: "/messages",
  description: "Real-time messaging — send, receive, and typing indicators",
})
export class MessageWSController extends WebSocketController {
  constructor(private readonly sendMessageUseCase: SendMessageUseCase) {
    super();
  }

  @Subscribe({
    event: "conversation:join",
    description: "Join a conversation room to receive real-time messages",
  })
  @ValidateEvent(joinConversationEventValidator)
  @JoinRoom(
    (data: JoinConversationEvent) => `conversation:${data.conversationId}`
  )
  @Publish({
    event: "conversation:joined",
    description: "Confirmation that the client joined the conversation room",
  })
  async handleJoinConversation(
    socket: Socket,
    data: JoinConversationEvent
  ): Promise<void> {
    socket.emit("conversation:joined", { conversationId: data.conversationId });
  }

  @Subscribe({
    event: "message:send",
    description: "Send a message in a conversation",
    acknowledgment: true,
  })
  @ValidateEvent(sendMessageEventValidator)
  @BroadcastTo(
    (data: SendMessageEvent) => `conversation:${data.conversationId}`
  )
  @Publish({
    event: "message:new",
    description:
      "New message broadcast to all participants in the conversation room",
    broadcast: true,
  })
  async handleSendMessage(
    socket: Socket,
    data: SendMessageEvent
  ): Promise<void> {
    const user = this.getSocketUser(socket);
    if (!user) return;

    const message = await this.sendMessageUseCase.execute(
      user.userId,
      data.conversationId,
      data.content
    );

    this.emitToRoom(
      `conversation:${data.conversationId}`,
      "message:new",
      message.toJSON()
    );
  }

  @Subscribe({
    event: "message:typing",
    description: "Broadcast typing indicator to other participants",
  })
  @ValidateEvent(typingEventValidator)
  @Publish({
    event: "message:typing",
    description: "Typing indicator broadcast to other participants in the room",
    broadcast: true,
  })
  async handleTyping(socket: Socket, data: TypingEvent): Promise<void> {
    const user = this.getSocketUser(socket);
    if (!user) return;

    socket.to(`conversation:${data.conversationId}`).emit("message:typing", {
      userId: user.userId,
      conversationId: data.conversationId,
    });
  }
}
