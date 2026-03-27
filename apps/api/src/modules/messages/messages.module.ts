import type { Router } from "express";
import type { Server } from "socket.io";
import { HybridModule } from "../../shared/infrastructure/base/modules/hybrid-module";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator";
import { ConversationRepository } from "../conversations/infrastructure/repositories/conversation.repository";
import { MessagesRestController } from "./application/controllers/messages.rest.controller";
import { MessageWSController } from "./application/controllers/messages.ws.controller";
import { DeleteMessageUseCase } from "./application/use-cases/delete-message.use-case";
import { EditMessageUseCase } from "./application/use-cases/edit-message.use-case";
import { GetMessagesUseCase } from "./application/use-cases/get-messages.use-case";
import { SendMessageUseCase } from "./application/use-cases/send-message.use-case";
import { MessageRepository } from "./infrastructure/repositories/message.repository";

class MessageModule extends HybridModule {
  private readonly messageRepository: MessageRepository;
  private readonly conversationRepository: ConversationRepository;

  private readonly getMessagesUseCase: GetMessagesUseCase;
  private readonly sendMessageUseCase: SendMessageUseCase;
  private readonly editMessageUseCase: EditMessageUseCase;
  private readonly deleteMessageUseCase: DeleteMessageUseCase;

  private readonly restController: MessagesRestController;
  private readonly wsController: MessageWSController;

  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({
      name: "Messages",
      description: "Message module (hybrid REST + WebSocket)",
    });

    this.messageRepository = new MessageRepository();
    this.conversationRepository = new ConversationRepository();

    this.getMessagesUseCase = new GetMessagesUseCase(
      this.messageRepository,
      this.conversationRepository
    );
    this.sendMessageUseCase = new SendMessageUseCase(
      this.messageRepository,
      this.conversationRepository
    );
    this.editMessageUseCase = new EditMessageUseCase(this.messageRepository);
    this.deleteMessageUseCase = new DeleteMessageUseCase(
      this.messageRepository
    );

    this.restController = new MessagesRestController(
      this.getMessagesUseCase,
      this.sendMessageUseCase,
      this.editMessageUseCase,
      this.deleteMessageUseCase
    );
    this.wsController = new MessageWSController(this.sendMessageUseCase);

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.restController);
  }

  public getRouter(): Router {
    return this.router;
  }

  public registerEvents(io: Server): void {
    this.wsController.registerEvents(io);
  }

  public getWSController(): MessageWSController {
    return this.wsController;
  }

  public getRestController(): MessagesRestController {
    return this.restController;
  }
}

export const messagesModule = new MessageModule();
