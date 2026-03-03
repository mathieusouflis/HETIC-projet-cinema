import type { Router } from "express";
import type { Server } from "socket.io";
import { HybridModule } from "../../shared/infrastructure/base/modules";
import { DecoratorRouter } from "../../shared/infrastructure/decorators";
import { MessagesRestController } from "./application/controllers/messages.rest.controller";
import { MessageWSController } from "./application/controllers/messages.ws.controller";

class MessageModule extends HybridModule {
  private readonly restController: MessagesRestController;
  private readonly wsController: MessageWSController;

  private readonly decoratorRouter: DecoratorRouter;
  private readonly router: Router;

  constructor() {
    super({
      name: "Messages",
      description: "Message module (hybrid)",
    });

    this.restController = new MessagesRestController();
    this.wsController = new MessageWSController();

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
