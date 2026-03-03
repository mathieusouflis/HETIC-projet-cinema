import type { Router } from "express";
import { RestModule } from "../../shared/infrastructure/base/modules/rest-module.js";
import { DecoratorRouter } from "../../shared/infrastructure/decorators/rest/router-generator.js";
import { FriendshipsRepository } from "../friendships/infrastructure/repositories/friendships.repository.js";
import { UserRepository } from "../users/infrastructure/database/repositories/user.repository.js";
import { ConversationsController } from "./application/controllers/conversations.controller.js";
import { CreateConversationUseCase } from "./application/use-cases/create-conversation.use-case.js";
import { GetConversationUseCase } from "./application/use-cases/get-conversation.use-case.js";
import { GetConversationsUseCase } from "./application/use-cases/get-conversations.use-case.js";
import { MarkConversationReadUseCase } from "./application/use-cases/mark-conversation-read.use-case.js";
import { ConversationRepository } from "./infrastructure/repositories/conversation.repository.js";

class ConversationsModule extends RestModule {
  private readonly conversationRepository: ConversationRepository;
  private readonly friendshipsRepository: FriendshipsRepository;
  private readonly userRepository: UserRepository;

  private readonly createConversationUseCase: CreateConversationUseCase;
  private readonly getConversationsUseCase: GetConversationsUseCase;
  private readonly getConversationUseCase: GetConversationUseCase;
  private readonly markConversationReadUseCase: MarkConversationReadUseCase;

  private readonly controller: ConversationsController;
  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({
      name: "Conversations",
      description: "Direct-message conversations between friends",
    });

    this.conversationRepository = new ConversationRepository();
    this.friendshipsRepository = new FriendshipsRepository();
    this.userRepository = new UserRepository();

    this.createConversationUseCase = new CreateConversationUseCase(
      this.conversationRepository,
      this.friendshipsRepository,
      this.userRepository
    );
    this.getConversationsUseCase = new GetConversationsUseCase(
      this.conversationRepository
    );
    this.getConversationUseCase = new GetConversationUseCase(
      this.conversationRepository
    );
    this.markConversationReadUseCase = new MarkConversationReadUseCase(
      this.conversationRepository
    );

    this.controller = new ConversationsController(
      this.createConversationUseCase,
      this.getConversationsUseCase,
      this.getConversationUseCase,
      this.markConversationReadUseCase
    );

    this.decoratorRouter = new DecoratorRouter();
    this.router = this.decoratorRouter.generateRouter(this.controller);
  }

  public getRouter(): Router {
    return this.router;
  }

  public getConversationRepository(): ConversationRepository {
    return this.conversationRepository;
  }
}

export const conversationsModule = new ConversationsModule();
